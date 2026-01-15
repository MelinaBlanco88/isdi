
import { addBusinessDays, addDays, getYear, parseISO, isSameYear } from 'date-fns'

export function calculatePaymentDate(invoiceDateStr: string, classDateStr: string, classType: string) {
    const invoiceDate = parseISO(invoiceDateStr)
    const classDate = parseISO(classDateStr)
    const classYear = getYear(classDate)

    if (classYear === 2025) {
        if (classType === 'in_company') {
            return addDays(invoiceDate, 90)
        } else {
            // Default to open program if not in_company (or specifically 'open')
            return addDays(invoiceDate, 60)
        }
    }

    // Default rule (2026 and onwards, and potentially pre-2025 if any)
    // 30 business days
    return addBusinessDays(invoiceDate, 30)
}
