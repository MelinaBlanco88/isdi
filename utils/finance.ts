
import { addBusinessDays, addDays, getYear, parseISO, isSameYear } from 'date-fns'

export function calculatePaymentDate(invoiceDateStr: string, classDateStr: string, classType: string) {
    // Append T00:00:00 to force local time parsing for date-only strings
    // This prevents timezone shifts when converting to Date objects (which default to UTC for YYYY-MM-DD)
    const invoiceDate = parseISO(invoiceDateStr.includes('T') ? invoiceDateStr : invoiceDateStr + 'T00:00:00')
    const classDate = parseISO(classDateStr.includes('T') ? classDateStr : classDateStr + 'T00:00:00')
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
