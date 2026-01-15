'use client'

import { markAsCompleted, deleteClass } from '@/app/actions/classes'
import { markInvoiceAsPaid } from '@/app/actions/invoices'
import { useState } from 'react'
import { CheckCircle, Upload, FileText, BadgeDollarSign, Trash2 } from 'lucide-react'
import InvoiceModal from '@/components/invoices/InvoiceModal'


export default function ClassActions({ classItem }: { classItem: any }) {
    const [loading, setLoading] = useState(false)
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)

    const handleMarkAsCompleted = async () => {
        if (!confirm('¿Marcar clase como dictada?')) return
        setLoading(true)
        await markAsCompleted(classItem.id)
        setLoading(false)
    }

    const handleMarkAsPaid = async (invoiceId: string) => {
        if (!confirm('¿Marcar factura como pagada?')) return
        setLoading(true)
        await markInvoiceAsPaid(invoiceId)
        setLoading(false)
    }

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de eliminar esta clase? Esta acción no se puede deshacer.')) return
        setLoading(true)
        await deleteClass(classItem.id)
        setLoading(false)
    }


    if (!classItem.class_completed) {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={handleMarkAsCompleted}
                    disabled={loading}
                    className="flex items-center gap-1 text-xs bg-black text-white px-2 py-1 rounded hover:bg-gray-800 disabled:opacity-50"
                >
                    <CheckCircle className="w-3 h-3" />
                    {loading ? '...' : 'Marcar dictada'}
                </button>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500 transition-colors"
                    title="Eliminar clase"
                >
                    <Trash2 size={14} />
                </button>
            </div >
        )
    }

    // If completed, show invoice actions
    // Check if invoice exists (we need to join or fetch invoice data in page.tsx)
    const hasInvoice = classItem.invoices && classItem.invoices.length > 0
    const invoice = hasInvoice ? classItem.invoices[0] : null

    return (
        <div className="flex items-center gap-2">
            {hasInvoice ? (
                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded border ${invoice.is_paid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                        <FileText className="w-3 h-3" />
                        {invoice.is_paid ? 'Pagada' : 'Facturada'}
                        {invoice.amount && <span className="font-semibold">${Number(invoice.amount).toFixed(2)}</span>}
                    </div>

                    {!invoice.is_paid && (
                        <button
                            onClick={() => handleMarkAsPaid(invoice.id)}
                            disabled={loading}
                            className="bg-green-600 text-white p-1 rounded hover:bg-green-700 disabled:opacity-50"
                            title="Marcar como pagada"
                        >
                            <BadgeDollarSign className="w-3 h-3" />
                        </button>
                    )}
                </div>
            ) : (

                <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="flex items-center gap-1 text-xs border border-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-50"
                >
                    <Upload className="w-3 h-3" />
                    Subir Factura
                </button>
            )}

            <button
                onClick={handleDelete}
                disabled={loading}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500 transition-colors ml-2"
                title="Eliminar clase"
            >
                <Trash2 size={14} />
            </button>

            {showInvoiceModal && (
                <InvoiceModal
                    classId={classItem.id}
                    defaultAmount={classItem.total_amount}
                    className={classItem.class_name}
                    classDate={classItem.date}
                    classType={classItem.class_type}
                    onClose={() => setShowInvoiceModal(false)}
                />
            )}
        </div>
    )
}
