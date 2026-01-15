'use client'

import { AlertTriangle } from 'lucide-react'

interface OverdueAlertProps {
    overdueCount: number
    totalOverdueAmount: number
}

export default function OverdueAlert({ overdueCount, totalOverdueAmount }: OverdueAlertProps) {
    if (overdueCount === 0) return null

    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4 animate-in slide-in-from-top-2">
            <div className="bg-red-100 p-2 rounded-lg text-red-600">
                <AlertTriangle size={24} />
            </div>
            <div>
                <h3 className="font-bold text-red-900">Pagos Vencidos Detectados</h3>
                <p className="text-sm text-red-700 mt-1">
                    Tienes <strong>{overdueCount}</strong> facturas que han superado la fecha estimada de cobro.
                    Monto total pendiente: <strong>${totalOverdueAmount.toFixed(2)}</strong>.
                </p>
                <p className="text-xs text-red-500 mt-2">
                    Te recomendamos contactar a administración para verificar el estado.
                </p>
            </div>
        </div>
    )
}
