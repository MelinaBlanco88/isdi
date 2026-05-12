import { createClient } from '@/utils/supabase/server'

import { FileText, CheckCircle, Clock, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'
import { format, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import { calculatePaymentDate } from '@/utils/finance'
import ExportPendingInvoicesButton from '@/components/invoices/ExportPendingInvoicesButton'
import InvoiceTable from '@/components/invoices/InvoiceTable'

export default async function BillingPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: rawInvoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*, classes(class_name, date, class_type)')
        .order('invoice_date', { ascending: false })

    if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError)
        return (
            <>
                <div className="p-8 text-red-500">
                    Error loading invoices: {invoicesError.message}
                </div>
            </>
        )
    }

    const invoicesData = (rawInvoices || []).map((inv) => {
        const classData = Array.isArray(inv.classes) ? inv.classes[0] : inv.classes
        return {
            ...inv,
            classes: classData,
        }
    })

    // Calculate summary stats
    const totalInvoices = invoicesData.length
    const paidInvoices = invoicesData.filter(i => i.is_paid)
    const pendingInvoices = invoicesData.filter(i => !i.is_paid)
    const totalPaid = paidInvoices.reduce((sum, i) => sum + Number(i.amount || 0), 0)
    const totalPending = pendingInvoices.reduce((sum, i) => sum + Number(i.amount || 0), 0)
    const overdueInvoices = pendingInvoices.filter(i => {
        try {
            if (!i.invoice_date || !i.classes?.date) return false
            const paymentDate = calculatePaymentDate(i.invoice_date, i.classes.date, i.classes?.class_type || 'open')
            return isPast(paymentDate)
        } catch { return false }
    })

    return (
        <>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Facturación</h1>
                        <p className="text-slate-500 mt-1">Historial de facturas y estados de pago</p>
                    </div>
                    <ExportPendingInvoicesButton invoices={invoicesData} />
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 rounded-lg">
                                <FileText size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Facturas</p>
                                <p className="text-2xl font-bold text-slate-900">{totalInvoices}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 rounded-lg">
                                <DollarSign size={18} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cobrado</p>
                                <p className="text-2xl font-bold text-emerald-600">${totalPaid.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 rounded-lg">
                                <Clock size={18} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pendiente</p>
                                <p className="text-2xl font-bold text-amber-600">${totalPending.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-50 rounded-lg">
                                <AlertTriangle size={18} className="text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Vencidas</p>
                                <p className="text-2xl font-bold text-red-600">{overdueInvoices.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice Table with Search & Filters */}
                <InvoiceTable invoices={invoicesData} />
            </div>
        </>
    )
}
