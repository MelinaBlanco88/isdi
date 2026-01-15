'use client'

import { Download } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { calculatePaymentDate } from '@/utils/finance'

interface ExportButtonProps {
    invoices: any[]
}

export default function ExportPendingInvoicesButton({ invoices }: ExportButtonProps) {

    const handleExport = () => {
        // Filter only pending invoices
        const pendingInvoices = invoices.filter(inv => !inv.is_paid)

        if (pendingInvoices.length === 0) {
            alert('No hay facturas pendientes para exportar.')
            return
        }

        // Prepare CSV Data
        const headers = ['Título de la Clase', 'Fecha Dictada', 'Fecha Estimada Pago', 'Tipo de Programa', 'Total Factura']

        const removeAccents = (str: string) => {
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        }

        const csvRows = pendingInvoices.map(inv => {
            const classTitle = inv.classes?.class_name || 'Sin nombre'
            const classDate = inv.classes?.date ? format(new Date(inv.classes.date), 'dd/MM/yyyy') : '--'

            // Use stored expected date or calculate if missing
            let estimatedDate = inv.expected_payment_date
            if (!estimatedDate && inv.invoice_date && inv.classes?.date) {
                const calcDate = calculatePaymentDate(inv.invoice_date, inv.classes.date, inv.classes.class_type || 'open')
                estimatedDate = format(calcDate, 'yyyy-MM-dd')
            }
            const formattedEstDate = estimatedDate ? format(new Date(estimatedDate), 'dd/MM/yyyy') : '--'

            const type = inv.classes?.class_type === 'in_company' ? 'In Company' : 'Programa Abierto'
            const amount = inv.amount || 0

            // Escape fields for CSV
            const escape = (field: any) => {
                const stringField = String(field)
                if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                    return `"${stringField.replace(/"/g, '""')}"`
                }
                return stringField
            }

            return [
                escape(classTitle),
                escape(classDate),
                escape(formattedEstDate),
                escape(type),
                escape(amount)
            ].join(',')
        })

        const csvContent = [headers.join(','), ...csvRows].join('\n')

        // Create Blob and Download
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `facturas_pendientes_${format(new Date(), 'yyyy-MM-dd')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
            <Download size={16} />
            Exportar Pendientes
        </button>
    )
}
