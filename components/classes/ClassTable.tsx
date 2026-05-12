'use client'

import { format, parseISO, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, DollarSign, Pencil, Check, X, Zap, Search, Filter, ChevronDown } from 'lucide-react'
import ClassActions from './ClassActions'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { calculatePaymentDate } from '@/utils/finance'
import { updateClassPrice } from '@/app/actions/classes'

export default function ClassTable({ classes }: { classes: any[] }) {
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')
    const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
    const [editPriceValue, setEditPriceValue] = useState<string>('')
    const [savingPrice, setSavingPrice] = useState(false)

    // Search & Filter state
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'open' | 'in_company' | 'special'>('all')
    const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'invoiced' | 'unpaid' | 'overdue'>('all')
    const [showFilters, setShowFilters] = useState(false)

    if (!classes || classes.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-slate-500">
                <p>No tienes clases registradas aún.</p>
            </div>
        )
    }

    const pendingClasses = classes.filter(c => !c.class_completed)
    const historyClasses = classes.filter(c => c.class_completed)

    const baseData = activeTab === 'pending' ? pendingClasses : historyClasses

    // Apply search and filters
    const dataToDisplay = useMemo(() => {
        let filtered = baseData

        // Text search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim()
            filtered = filtered.filter(cls => {
                const name = (cls.class_name || '').toLowerCase()
                const location = (cls.location || '').toLowerCase()
                const date = (cls.date || '').toLowerCase()
                const amount = (cls.total_amount?.toString() || '')
                const invoiceFolio = (cls.invoices?.[0]?.folio_fiscal || '').toLowerCase()
                return name.includes(q) || location.includes(q) || date.includes(q) || amount.includes(q) || invoiceFolio.includes(q)
            })
        }

        // Type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(cls => cls.class_type === filterType)
        }

        // Payment status filter
        if (filterPayment !== 'all') {
            filtered = filtered.filter(cls => {
                const invoice = cls.invoices?.[0]
                if (filterPayment === 'paid') return invoice?.is_paid === true
                if (filterPayment === 'invoiced') return invoice && !invoice.is_paid
                if (filterPayment === 'unpaid') return !invoice
                if (filterPayment === 'overdue') {
                    if (!invoice || invoice.is_paid) return false
                    try {
                        const baseDate = invoice.issue_date || cls.date
                        const paymentDate = calculatePaymentDate(baseDate, cls.date, cls.class_type)
                        return isPast(paymentDate)
                    } catch { return false }
                }
                return true
            })
        }

        return filtered
    }, [baseData, searchQuery, filterType, filterPayment])

    const startEditPrice = (cls: any) => {
        setEditingPriceId(cls.id)
        setEditPriceValue(cls.total_amount?.toString() || '0')
    }

    const cancelEditPrice = () => {
        setEditingPriceId(null)
        setEditPriceValue('')
    }

    const savePrice = async (classId: string) => {
        setSavingPrice(true)
        const newAmount = parseFloat(editPriceValue) || 0
        await updateClassPrice(classId, newAmount)
        setEditingPriceId(null)
        setEditPriceValue('')
        setSavingPrice(false)
    }

    const fmtMoney = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    const hasActiveFilters = filterType !== 'all' || filterPayment !== 'all' || searchQuery.trim() !== ''

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="flex p-1 bg-slate-100 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${activeTab === 'pending'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Pendientes ({pendingClasses.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${activeTab === 'history'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Dictadas ({historyClasses.length})
                    </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar clase, folio, lugar..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:border-slate-300 placeholder:text-slate-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-all cursor-pointer ${showFilters || hasActiveFilters
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Filter size={14} />
                        Filtros
                        {hasActiveFilters && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                        <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-4 animate-in slide-in-from-top-2 duration-200">
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

                    <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado de Pago</label>
                        <div className="flex gap-1.5">
                            {[
                                { value: 'all', label: 'Todos' },
                                { value: 'paid', label: 'Pagadas' },
                                { value: 'invoiced', label: 'Facturadas' },
                                { value: 'unpaid', label: 'Sin factura' },
                                { value: 'overdue', label: 'Vencidas' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFilterPayment(opt.value as any)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${filterPayment === opt.value
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
                                onClick={() => { setFilterType('all'); setFilterPayment('all'); setSearchQuery('') }}
                                className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Results info */}
            {hasActiveFilters && (
                <p className="text-xs text-slate-500">
                    Mostrando <span className="font-semibold text-slate-700">{dataToDisplay.length}</span> de {baseData.length} clases
                </p>
            )}

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b">
                            <tr>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Clase</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Fecha Clase</th>
                                <th className="px-6 py-4">
                                    <div className="flex items-center gap-1">
                                        <DollarSign size={12} />
                                        Monto
                                    </div>
                                </th>
                                {activeTab === 'history' && (
                                    <th className="px-6 py-4 text-orange-600">Fecha Est. Pago</th>
                                )}
                                <th className="px-6 py-4">Lugar</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {dataToDisplay.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search size={24} className="text-slate-300" />
                                            <p className="text-slate-400 font-medium">No se encontraron resultados</p>
                                            {hasActiveFilters && (
                                                <button
                                                    onClick={() => { setFilterType('all'); setFilterPayment('all'); setSearchQuery('') }}
                                                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                                                >
                                                    Limpiar filtros
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {dataToDisplay.map((cls) => {
                                const invoice = cls.invoices?.[0]
                                let statusBadge
                                let estimatedPaymentDate = null
                                let isOverdue = false

                                if (invoice) {
                                    const baseDate = invoice.issue_date || cls.date
                                    estimatedPaymentDate = calculatePaymentDate(baseDate, cls.date, cls.class_type)

                                    if (!invoice.is_paid && isPast(estimatedPaymentDate)) {
                                        isOverdue = true
                                    }
                                }


                                if (invoice?.is_paid) {
                                    statusBadge = <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Pagada</span>
                                } else if (invoice) {
                                    statusBadge = <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Facturada</span>
                                } else if (cls.class_completed) {
                                    statusBadge = <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Dictada</span>
                                } else {
                                    statusBadge = <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Pendiente</span>
                                }

                                const isEditingThis = editingPriceId === cls.id

                                return (
                                    <tr key={cls.id} className={`hover:bg-slate-50 transition-colors ${isOverdue ? 'bg-red-50/50 hover:bg-red-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {statusBadge}
                                            {isOverdue && <span className="ml-2 text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">VENCIDO</span>}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900 group cursor-pointer">
                                            <Link href={`/classes/${cls.id}`} className="hover:text-blue-600 transition-colors flex items-center gap-2">
                                                {cls.class_name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            {cls.class_type === 'in_company' ? (
                                                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                    In Company
                                                </span>
                                            ) : cls.class_type === 'special' ? (
                                                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 gap-1">
                                                    <Zap size={10} /> Especial
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    Abierto
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span>{format(parseISO(cls.date + 'T00:00:00'), 'dd MMM yyyy', { locale: es })}</span>
                                                <span className="text-xs text-slate-400">{cls.time.slice(0, 5)}</span>
                                            </div>
                                        </td>
                                        {/* Monto column with inline editing */}
                                        <td className="px-6 py-4">
                                            {isEditingThis ? (
                                                <div className="flex items-center gap-1.5">
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={editPriceValue}
                                                            onChange={(e) => setEditPriceValue(e.target.value)}
                                                            className="w-28 pl-5 pr-2 py-1.5 text-xs border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50/50 font-mono"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault()
                                                                    savePrice(cls.id)
                                                                }
                                                                if (e.key === 'Escape') cancelEditPrice()
                                                            }}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => savePrice(cls.id)}
                                                        disabled={savingPrice}
                                                        className="p-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors cursor-pointer disabled:opacity-50"
                                                        title="Guardar"
                                                    >
                                                        <Check size={12} />
                                                    </button>
                                                    <button
                                                        onClick={cancelEditPrice}
                                                        className="p-1 bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
                                                        title="Cancelar"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 group/price">
                                                    <span className="font-mono text-slate-700 font-medium">
                                                        ${fmtMoney(Number(cls.total_amount) || 0)}
                                                    </span>
                                                    <button
                                                        onClick={() => startEditPrice(cls)}
                                                        className="p-1 rounded-md text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer opacity-0 group-hover/price:opacity-100"
                                                        title="Editar precio"
                                                    >
                                                        <Pencil size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        {activeTab === 'history' && (
                                            <td className="px-6 py-4">
                                                {estimatedPaymentDate ? (
                                                    <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                                                        <Clock size={14} />
                                                        <span>{format(estimatedPaymentDate, 'dd MMM yyyy', { locale: es })}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">--</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            {cls.is_online ? '🌐 Online' : cls.location}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end">
                                                <ClassActions classItem={cls} />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
