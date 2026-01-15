'use client'

import { createClass } from '@/app/actions/classes'
import { useRef, useState, useEffect } from 'react'
import { Plus, X, MapPin, Calendar, Clock, Laptop, DollarSign, Timer } from 'lucide-react'

export default function NewClassForm() {
    const formRef = useRef<HTMLFormElement>(null)
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    // Pricing State
    const [hours, setHours] = useState<string>('')
    const [rate, setRate] = useState<string>('1900')

    // Calculation State
    const [subtotal, setSubtotal] = useState<number>(0)
    const [iva, setIva] = useState<number>(0)
    const [retIva, setRetIva] = useState<number>(0)
    const [retIsr, setRetIsr] = useState<number>(0)
    const [netTotal, setNetTotal] = useState<number>(0)

    // Class Type State
    const [classType, setClassType] = useState('open') // 'open' | 'in_company'

    useEffect(() => {
        const h = parseFloat(hours) || 0
        const r = parseFloat(rate) || 0

        const calculatedSubtotal = h * r
        const calculatedIva = calculatedSubtotal * 0.16
        const calculatedRetIva = calculatedSubtotal * 0.106667
        const calculatedRetIsr = calculatedSubtotal * 0.10

        const calculatedNet = calculatedSubtotal + calculatedIva - calculatedRetIva - calculatedRetIsr

        setSubtotal(calculatedSubtotal)
        setIva(calculatedIva)
        setRetIva(calculatedRetIva)
        setRetIsr(calculatedRetIsr)
        setNetTotal(calculatedNet)
    }, [hours, rate])

    async function clientAction(formData: FormData) {
        setLoading(true)
        // Ensure we send the NET total as the final amount
        formData.set('total_amount', netTotal.toString())
        formData.set('class_type', classType)

        await createClass(formData)
        setIsOpen(false)
        setLoading(false)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                <Plus size={20} />
                <span className="font-medium">Nueva Clase</span>
            </button>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 fade-in duration-300">

                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Programar Clase</h2>
                        <p className="text-sm text-slate-500">Agrega una nueva sesión a tu calendario.</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                <form ref={formRef} action={clientAction} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre de la clase / Tema</label>
                        <input
                            type="text"
                            name="class_name"
                            required
                            placeholder="Ej. Estrategia Digital - Módulo 3"
                            className="w-full border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                <Calendar size={14} /> Fecha
                            </label>
                            <input
                                type="date"
                                name="date"
                                required
                                className="w-full border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                <Clock size={14} /> Hora
                            </label>
                            <input
                                type="time"
                                name="time"
                                required
                                className="w-full border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 block">Tipo de Programa</label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setClassType('open')
                                    setRate('1900')
                                }}
                                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${classType === 'open'
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                Programa Abierto
                                <span className="block text-xs font-normal opacity-70 mt-0.5">$1,900 / hr</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setClassType('in_company')
                                    setRate('4200')
                                }}
                                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${classType === 'in_company'
                                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                In Company
                                <span className="block text-xs font-normal opacity-70 mt-0.5">$4,200 / hr</span>
                            </button>
                        </div>
                    </div>

                    {/* Pricing Section */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                    <Timer size={12} /> Horas
                                </label>
                                <input
                                    type="number"
                                    name="class_hours"
                                    min="0"
                                    step="0.5"
                                    placeholder="0"
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value)}
                                    className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                    <DollarSign size={12} /> $/Hora (Subtotal)
                                </label>
                                <input
                                    type="number"
                                    name="hourly_rate"
                                    min="0"
                                    placeholder="0"
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value)}
                                    className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
                                />
                            </div>
                        </div>

                        {/* Tax Breakdown */}
                        {subtotal > 0 && (
                            <div className="pt-2 border-t border-slate-200/60 space-y-1">
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Subtotal:</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>+ IVA (16%):</span>
                                    <span>${iva.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-red-500">
                                    <span>- Ret. IVA (10.6667%):</span>
                                    <span>-${retIva.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-red-500">
                                    <span>- Ret. ISR (10%):</span>
                                    <span>-${retIsr.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                                    <span>Total Neto a Recibir:</span>
                                    <span className="text-green-600">${netTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        <input type="hidden" name="total_amount" value={netTotal} />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                            <MapPin size={14} /> Lugar / Link
                        </label>
                        <input
                            type="text"
                            name="location"
                            placeholder="Ej. Sala C, Edificio 1 / Zoom Link"
                            className="w-full border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:border-slate-300 transition-colors">
                        <input
                            type="checkbox"
                            name="is_online"
                            id="is_online"
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-4 w-4"
                        />
                        <label htmlFor="is_online" className="text-sm font-medium text-slate-700 flex items-center gap-2 cursor-pointer select-none flex-1">
                            <Laptop size={16} className="text-slate-500" /> Es una clase Online
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {loading ? 'Guardando...' : 'Programar Clase'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
