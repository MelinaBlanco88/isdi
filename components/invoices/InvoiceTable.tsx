'use client'

import { useState, useMemo } from 'react'
import { format, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import { FileText, CheckCircle, Clock, AlertTriangle, DollarSign, Search, Filter, ChevronDown, X, Zap } from 'lucide-react'
import { calculatePaymentDate } from '@/utils/finance'
import MarkPaidButton from './MarkPaidButton'

interface InvoiceData {
    id: string
    invoice_date: string
    is_paid: boolean
    amount: number
    folio_fiscal?: string
    invoice_file_url?: string
    classes?: {
        class_name: string
        date: string
        class_type: string
    }
}

export default function InvoiceTable({ invoices }: { invoices: InvoiceData[] }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')
    const [filterType, setFilterType] = useState<'all' | 'open' | 'in_company' | 'special'>('all')
    const [showFilters, setShowFilters] = useState(false)

    const filteredInvoices = useMemo(() => {
        let filtered = invoices

        // Text search: folio, class name, amount, dates
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim()
            filtered = filtered.filter(inv => {
                const folio = (inv.folio_fiscal || '').toLowerCase()
                const className = (inv.classes?.class_name || '').toLowerCase()
                const amount = (inv.amount?.toString() || '')
                const invoiceDate = (inv.invoice_date || '').toLowerCase()
                return folio.includes(q) || className.includes(q) || amount.includes(q) || invoiceDate.includes(q)
            })
        }

        // Status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(inv => {
                if (filterStatus === 'paid') return inv.is_paid
                if (filterStatus === 'pending') return !inv.is_paid
                if (filterStatus === 'overdue') {
                    if (inv.is_paid) return false
                    try {
                        if (!inv.invoice_date || !inv.classes?.date) return false
                        const paymentDate = calculatePaymentDate(inv.invoice_date, inv.classes.date, inv.classes?.class_type || 'open')
                        return isPast(paymentDate)
                    } catch { return false }
                }
                return true
            })
        }

        // Type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(inv => (inv.classes?.class_type || 'open') === filterType)
        }

        return filtered
    }, [invoices, searchQuery, filterStatus, filterType])

    const hasActiveFilters = filterStatus !== 'all' || filterType !== 'all' || searchQuery.trim() !== ''

    if (!invoices || invoices.length === 0) {
        return (
            <div className="p-16 text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-slate-100 rounded-2xl">
                        <FileText size={40} className="text-slate-400" />
                    </div>
                </div>
                <p className="font-semibold text-slate-900 text-lg">No hay facturas registradas</p>
                <p className="text-sm text-slate-500 mt-1">Sube una factura desde la sección de Clases para verla aquí.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por folio fiscal, clase, monto..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:border-slate-300 placeholder:text-slate-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-sm border rounded-lg transition-all cursor-pointer ${showFilters || hasActiveFilters
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <Filter size={14} />
                    Filtros
                    {hasActiveFilters && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                    <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado</label>
                        <div className="flex gap-1.5">
                            {[
                                { value: 'all', label: 'Todas' },
                                { value: 'paid', label: 'Pagadas' },
                                { value: 'pending', label: 'Pendientes' },
                                { value: 'overdue', label: 'Vencidas' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFilterStatus(opt.value as any)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${filterStatus === opt.value
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo de Programa</label>
                        <div className="flex gap-1.5">
                            {[
                                { value: 'all', label: 'Todos' },
                                { value: 'open', label: 'Abierto' },
                                { value: 'in_company', label: 'In Company' },
                                { value: 'special', label: 'Especial' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFilterType(opt.value as any)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${filterType === opt.value
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <>
                            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                            <button
                                onClick={() => { setFilterStatus('all'); setFilterType('all'); setSearchQuery('') }}
                                className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Results count */}
            {hasActiveFilters && (
                <p className="text-xs text-slate-500">
                    Mostrando <span className="font-semibold text-slate-700">{filteredInvoices.length}</span> de {invoices.length} facturas
                </p>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {filteredInvoices.length > 0 ? (
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
                                {filteredInvoices.map((inv) => {
                                    let isOverdue = false
                                    let paymentDate: Date | null = null
                                    try {
                                        if (inv.invoice_date && inv.classes?.date) {
                                            paymentDate = calculatePaymentDate(inv.invoice_date, inv.classes.date, inv.classes?.class_type || 'open')
                                            isOverdue = !inv.is_paid && isPast(paymentDate)
                                        }
                                    } catch { }

                                    return (
                                        <tr key={inv.id} className={`hover:bg-slate-50/50 transition-colors group ${isOverdue ? 'bg-red-50/30' : ''}`}>
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
                                                ) : inv.classes?.class_type === 'special' ? (
                                                    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 gap-1">
                                                        <Zap size={10} /> Especial
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
                    <div className="p-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <Search size={24} className="text-slate-300" />
                            <p className="text-slate-400 font-medium">No se encontraron facturas</p>
                            {hasActiveFilters && (
                                <button
                                    onClick={() => { setFilterStatus('all'); setFilterType('all'); setSearchQuery('') }}
                                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                                >
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
