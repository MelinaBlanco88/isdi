'use client'

import { createClient } from '@/utils/supabase/client'
import { createInvoice } from '@/app/actions/invoices'
import { useState, useRef, useEffect } from 'react'
import { calculatePaymentDate } from '@/utils/finance'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, UploadCloud, Calendar, DollarSign, FileText, Clock, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'


interface InvoiceModalProps {
    classId: string
    defaultAmount?: number | string | null
    className?: string
    classDate: string
    classType: string
    onClose: () => void
}

export default function InvoiceModal({ classId, defaultAmount, className, classDate, classType, onClose }: InvoiceModalProps) {
    const [loading, setLoading] = useState(false)
    const [invoiceDate, setInvoiceDate] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [calculatedDate, setCalculatedDate] = useState<string | null>(null)



    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value
        setInvoiceDate(date)
        if (date) {
            const expected = calculatePaymentDate(date, classDate, classType)
            setCalculatedDate(format(expected, 'yyyy-MM-dd'))
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !invoiceDate) return

        setLoading(true)
        const supabase = createClient()
        const fileExt = file.name.split('.').pop()
        const fileName = `${classId}-${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        // 1. Upload File
        const { error: uploadError } = await supabase.storage
            .from('invoices')
            .upload(filePath, file)

        if (uploadError) {
            alert('Error uploading file')
            setLoading(false)
            return
        }

        // 2. Create Record
        const formData = new FormData()
        formData.append('class_id', classId)
        formData.append('invoice_date', invoiceDate)
        formData.append('file_path', filePath)
        // Use defaultAmount directly, fallback to 0 if missing
        formData.append('amount', defaultAmount ? defaultAmount.toString() : '0')

        const result = await createInvoice(formData)

        setLoading(false)
        if (result.error) {
            alert(result.error)
        } else {
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden text-slate-900">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Subir Factura</h2>
                        <p className="text-sm text-slate-500">Registra una nueva factura para esta clase.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Calendar size={14} /> Fecha de Emisión
                            </label>
                            <input
                                type="date"
                                required
                                value={invoiceDate}
                                onChange={handleDateChange}
                                className="w-full border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <DollarSign size={14} /> Monto Total
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                                <input
                                    type="text"
                                    value={defaultAmount ? Number(defaultAmount).toFixed(2) : '0.00'}
                                    disabled
                                    className="w-full bg-slate-50 border-slate-200 rounded-lg pl-7 pr-3 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400">* Tomado del total de la clase</p>
                        </div>
                    </div>

                    {calculatedDate && (
                        <div className="flex items-start gap-3 bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-900">Fecha Estimada de Cobro</p>
                                <p className="text-sm text-blue-700 mt-0.5">
                                    {format(new Date(calculatedDate), 'EEEE d MMMM, yyyy', { locale: es })}
                                </p>
                                <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                                    <Clock size={12} className="inline" /> Calculada según políticas de pago
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <FileText size={14} /> Comprobante
                        </label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 transition-colors hover:bg-slate-50/50 hover:border-blue-400 group text-center cursor-pointer relative">
                            <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                required
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-3 bg-slate-100 rounded-full text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    <UploadCloud size={24} />
                                </div>
                                <p className="text-sm font-medium text-slate-700">
                                    {file ? file.name : "Click para subir archivo"}
                                </p>
                                <p className="text-xs text-slate-400">PDF, PNG, JPG hasta 5MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                const subject = encodeURIComponent(`Factura - ${className || 'Clase'}`)
                                const body = encodeURIComponent(`Hola Norma buenos días,

Te adjunto la factura de la clase ${className || '[Nombre de la clase]'}

También mis datos bancarios para el pago:

Mi cuenta Santander a Nombre de: MELINA GISEL BLANCO
cuenta CLABE: 014180605850983138
Número de cuenta: 60585098313
Tarjeta asociada: 5579070061218866

Cualquier cosa estoy al pendiente.

Muchas gracias,

Saludos!`)
                                // Added facturacion@isdi.mx to the recipients
                                window.open(`mailto:facturacion@isdi.mx?subject=${subject}&body=${body}`)
                            }}
                            className="text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center gap-2 px-2"
                        >
                            <Mail size={16} /> Preparar Correo
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : 'Guardar Factura'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

