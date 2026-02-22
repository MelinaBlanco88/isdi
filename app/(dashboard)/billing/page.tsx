import { createClient } from '@/utils/supabase/server'

import { FileText, CheckCircle, Clock, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'
import { format, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import { calculatePaymentDate } from '@/utils/finance'
import ExportPendingInvoicesButton from '@/components/invoices/ExportPendingInvoicesButton'
import MarkPaidButton from '@/components/invoices/MarkPaidButton'

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

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {invoicesData && invoicesData.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-4">Estado</th>
                                        <th className="px-5 py-4">Clase / Concepto</th>
                                        <th className="px-5 py-4">Tipo</th>
                                        <th className="px-5 py-4">Fecha Emisión</th>
                                        <th className="px-5 py-4">Fecha Pago Est.</th>
                                        <th className="px-5 py-4">Monto</th>
                                        <th className="px-5 py-4">Folio Fiscal</th>
                                        <th className="px-5 py-4 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {invoicesData.map((inv) => {
                                        let isOverdue = false
                                        let paymentDate: Date | null = null
                                        try {
                                            if (inv.invoice_date && inv.classes?.date) {
                                                paymentDate = calculatePaymentDate(inv.invoice_date, inv.classes.date, inv.classes?.class_type || 'open')
                                                isOverdue = !inv.is_paid && isPast(paymentDate)
                                            }
                                        } catch { }

                                        return (
                                            <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-5 py-4">
                                                    {inv.is_paid ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <CheckCircle size={12} /> Pagada
                                                        </span>
                                                    ) : isOverdue ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 animate-pulse">
                                                            <AlertTriangle size={12} /> Vencida
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                            <Clock size={12} /> Pendiente
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-slate-900 leading-tight">{inv.classes?.class_name || 'Clase eliminada'}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {inv.classes?.date && format(new Date(inv.classes.date), 'dd MMM yyyy', { locale: es })}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {inv.classes?.class_type === 'in_company' ? (
                                                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100">
                                                            In Company
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
                                                            Abierto
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-slate-600">
                                                    {(() => {
                                                        try {
                                                            return inv.invoice_date
                                                                ? format(new Date(inv.invoice_date), 'dd MMM yyyy', { locale: es })
                                                                : '—'
                                                        } catch { return '—' }
                                                    })()}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {paymentDate ? (
                                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${isOverdue
                                                            ? 'bg-red-50 text-red-700 border-red-100'
                                                            : inv.is_paid
                                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                                : 'bg-violet-50 text-violet-700 border-violet-100'
                                                            }`}>
                                                            <Clock size={13} />
                                                            <span>{format(paymentDate, 'dd MMM yyyy', { locale: es })}</span>
                                                            {isOverdue && <span className="text-[10px] bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full ml-1 font-bold">VENCIDO</span>}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300">—</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="font-mono font-semibold text-slate-900">
                                                        ${Number(inv.amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {inv.folio_fiscal ? (
                                                        <span className="font-mono text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 inline-block max-w-[200px] truncate" title={inv.folio_fiscal}>
                                                            {inv.folio_fiscal}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <MarkPaidButton invoiceId={inv.id} isPaid={inv.is_paid} />
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-16 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-slate-100 rounded-2xl">
                                    <FileText size={40} className="text-slate-400" />
                                </div>
                            </div>
                            <p className="font-semibold text-slate-900 text-lg">No hay facturas registradas</p>
                            <p className="text-sm text-slate-500 mt-1">Sube una factura desde la sección de Clases para verla aquí.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
