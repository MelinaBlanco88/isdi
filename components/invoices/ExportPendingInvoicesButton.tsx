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

        // Headers
        const headers = [
            'Titulo de la Clase',
            'Tipo de Programa',
            'Fecha Dictada',
            'Fecha Emision Factura',
            'Fecha Estimada Pago',
            'Folio Fiscal',
            'Total Factura'
        ]

        const escapeField = (field: any): string => {
            const str = String(field ?? '')
            // Always wrap in quotes for safe Google Sheets import
            return `"${str.replace(/"/g, '""')}"`
        }

        // Format a number to exactly 2 decimals as a clean numeric string
        const fmtNumber = (n: any): string => {
            const num = Number(n) || 0
            return num.toFixed(2)
        }

        let grandTotal = 0

        const csvRows = pendingInvoices.map(inv => {
            const classTitle = inv.classes?.class_name || 'Sin nombre'

            const classType = inv.classes?.class_type === 'in_company'
                ? 'In Company'
                : inv.classes?.class_type === 'special'
                    ? 'Sesion Especial'
                    : 'Programa Abierto'

            const classDate = inv.classes?.date
                ? format(new Date(inv.classes.date), 'dd/MM/yyyy')
                : ''

            const invoiceDate = inv.invoice_date
                ? format(new Date(inv.invoice_date), 'dd/MM/yyyy')
                : ''

            // Calculate estimated payment date
            let estimatedDate = ''
            if (inv.invoice_date && inv.classes?.date) {
                try {
                    const calcDate = calculatePaymentDate(inv.invoice_date, inv.classes.date, inv.classes.class_type || 'open')
                    estimatedDate = format(calcDate, 'dd/MM/yyyy')
                } catch { }
            }

            const folio = inv.folio_fiscal || ''
            const amount = Number(inv.amount) || 0
            grandTotal += amount

            return [
                escapeField(classTitle),
                escapeField(classType),
                escapeField(classDate),
                escapeField(invoiceDate),
                escapeField(estimatedDate),
                escapeField(folio),
                fmtNumber(amount) // No quotes so Google Sheets treats it as number
            ].join(',')
        })

        // Empty separator row
        const emptyRow = Array(headers.length).fill('').join(',')

        // Total row: label in first column, amount in last column
        const totalRow = [
            escapeField('TOTAL PENDIENTE'),
            '', '', '', '', '',
            fmtNumber(grandTotal)
        ].join(',')

        // Count row
        const countRow = [
            escapeField(`Total de facturas: ${pendingInvoices.length}`),
            '', '', '', '', '',
            ''
        ].join(',')

        // Exported date row
        const exportDateRow = [
            escapeField(`Exportado: ${format(new Date(), "dd 'de' MMMM yyyy, HH:mm", { locale: es })}`),
            '', '', '', '', '',
            ''
        ].join(',')

        const csvContent = [
            headers.map(h => escapeField(h)).join(','),
            ...csvRows,
            emptyRow,
            totalRow,
            countRow,
            exportDateRow
        ].join('\n')

        // BOM + CSV for proper UTF-8 in Google Sheets
        const blob = new Blob(
            [new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent],
            { type: 'text/csv;charset=utf-8;' }
        )
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `facturas_pendientes_${format(new Date(), 'yyyy-MM-dd')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
        >
            <Download size={16} />
            Exportar Pendientes
        </button>
    )
}
