'use client'

import { useState } from 'react'
import { markInvoiceAsPaid } from '@/app/actions/invoices'
import { CheckCircle, Loader2 } from 'lucide-react'

interface MarkPaidButtonProps {
    invoiceId: string
    isPaid: boolean
}

export default function MarkPaidButton({ invoiceId, isPaid }: MarkPaidButtonProps) {
    const [loading, setLoading] = useState(false)
    const [paid, setPaid] = useState(isPaid)

    const handleClick = async () => {
        if (paid || loading) return
        setLoading(true)
        const result = await markInvoiceAsPaid(invoiceId)
        if (result.success) {
            setPaid(true)
        } else {
            alert('Error al marcar como pagada')
        }
        setLoading(false)
    }

    if (paid) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle size={13} /> Pagada
            </span>
        )
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all duration-200 cursor-pointer disabled:opacity-50 group"
        >
            {loading ? (
                <>
                    <Loader2 size={13} className="animate-spin" /> Guardando...
                </>
            ) : (
                <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 group-hover:border-emerald-500 group-hover:bg-emerald-500 transition-all duration-200 flex items-center justify-center">
                        <CheckCircle size={8} className="opacity-0 group-hover:opacity-100 text-white transition-opacity" />
                    </span>
                    Pendiente
                </>
            )}
        </button>
    )
}
