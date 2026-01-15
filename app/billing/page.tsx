import { createClient } from '@/utils/supabase/server'
import AppShell from '@/components/layout/AppShell'
import { FileText, Download, CheckCircle, Clock } from 'lucide-react'
import { format, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import { calculatePaymentDate } from '@/utils/finance'

import ExportPendingInvoicesButton from '@/components/invoices/ExportPendingInvoicesButton'

export default async function BillingPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Fetch only classes that have invoices
    // Fetch only classes that have invoices
    const { data: rawInvoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*, classes(class_name, date, class_type)')
        .order('invoice_date', { ascending: false })

    if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError)
        // You might want to handle this UI gracefully, but for now let's just log it 
        // or return an error state if critical.
        // For debugging purpose with the user:
        return (
            <AppShell>
                <div className="p-8 text-red-500">
                    Error loading invoices: {invoicesError.message}
                </div>
            </AppShell>
        )
    }
    // ... (lines 20-50 preserved in logic, but here I update the render part)

    // Wait, I can't effectively replace the top imports AND the render part in one go correctly with replace_file_content if I'm not careful.
    // I will use multi_replace for safety.

    const invoicesData = await Promise.all((rawInvoices || []).map(async (inv) => {
        try {
            // Safe access to potential array relationship
            const classData = Array.isArray(inv.classes) ? inv.classes[0] : inv.classes

            let signedUrl = null
            if (inv.file_path) {
                const { data, error } = await supabase.storage
                    .from('invoices')
                    // Add download: true to force Content-Disposition: attachment
                    .createSignedUrl(inv.file_path, 3600, { download: true })

                if (!error && data) {
                    signedUrl = data.signedUrl
                }
            }

            return {
                ...inv,
                classes: classData, // Normalize classes to object
                downloadUrl: signedUrl
            }
        } catch (error) {
            console.error('Error processing invoice:', error)
            return { ...inv, downloadUrl: null }
        }
    }))

    return (
        <AppShell>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Facturación</h1>
                        <p className="text-slate-500">Historial de facturas y estados de pago.</p>
                    </div>
                    <ExportPendingInvoicesButton invoices={invoicesData} />
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {invoicesData && invoicesData.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b">
                                    <tr>
                                        <th className="px-6 py-4">Estado</th>
                                        <th className="px-6 py-4">Clase / Concepto</th>
                                        <th className="px-6 py-4">Tipo</th>
                                        <th className="px-6 py-4">Fecha Emisión</th>
                                        <th className="px-6 py-4">Fecha Pago Est.</th>
                                        <th className="px-6 py-4">Monto</th>
                                        <th className="px-6 py-4 text-right">Comprobante</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {invoicesData.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                {inv.is_paid ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle size={12} /> Pagada
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                        <Clock size={12} /> Pendiente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-900">{inv.classes?.class_name || 'Clase eliminada'}</p>
                                                <p className="text-xs text-slate-400">
                                                    {inv.classes?.date && format(new Date(inv.classes.date), 'dd MMM yyyy', { locale: es })}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {inv.classes?.class_type === 'in_company' ? (
                                                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                        In Company
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                        Abierto
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {(() => {
                                                    try {
                                                        return inv.invoice_date
                                                            ? format(new Date(inv.invoice_date), 'dd MMM yyyy', { locale: es })
                                                            : 'Fecha inválida'
                                                    } catch (e) {
                                                        return 'Fecha inválida'
                                                    }
                                                })()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {(() => {
                                                    try {
                                                        if (!inv.invoice_date || !inv.classes?.date) return '--'
                                                        const paymentDate = calculatePaymentDate(inv.invoice_date, inv.classes.date, inv.classes?.class_type || 'open')
                                                        const isOverdue = !inv.is_paid && isPast(paymentDate)

                                                        return (
                                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border ${isOverdue
                                                                ? 'bg-red-50 text-red-700 border-red-100'
                                                                : 'bg-purple-50 text-purple-700 border-purple-100'
                                                                }`}>
                                                                <Clock size={14} />
                                                                <span>{format(paymentDate, 'dd MMM yyyy', { locale: es })}</span>
                                                                {isOverdue && <span className="text-[10px] bg-red-200 text-red-800 px-1 rounded ml-1">VENCIDO</span>}
                                                            </div>
                                                        )
                                                    } catch (e) {
                                                        return '--'
                                                    }
                                                })()}
                                            </td>
                                            <td className="px-6 py-4 font-mono font-medium text-slate-900">
                                                ${Number(inv.amount).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {/* Since files are private/protected, logic might differ but assuming standard storage URL logic here for simplicity */}
                                                {inv.downloadUrl ? (
                                                    <a
                                                        href={inv.downloadUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 hover:underline text-xs font-medium flex items-center justify-end gap-1 ml-auto"
                                                    >
                                                        <Download size={14} /> Descargar
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-300 text-xs text-right">No disponible</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            <div className="flex justify-center mb-4 text-slate-300">
                                <FileText size={48} />
                            </div>
                            <p className="font-medium text-slate-900">No hay facturas registradas</p>
                            <p className="text-sm">Sube una factura desde la sección de Clases para verla aquí.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    )
}
