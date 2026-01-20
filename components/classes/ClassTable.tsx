'use client'

import { format, addBusinessDays, parseISO, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import { MoreHorizontal, FileText, Upload, CheckCircle, Clock } from 'lucide-react'
import ClassActions from './ClassActions'
import Link from 'next/link'
import { useState } from 'react'
import { calculatePaymentDate } from '@/utils/finance'

export default function ClassTable({ classes }: { classes: any[] }) {
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')

    if (!classes || classes.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-slate-500">
                <p>No tienes clases registradas aún.</p>
            </div>
        )
    }

    const pendingClasses = classes.filter(c => !c.class_completed)
    const historyClasses = classes.filter(c => c.class_completed)

    const dataToDisplay = activeTab === 'pending' ? pendingClasses : historyClasses

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'pending'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Pendientes por dictar ({pendingClasses.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'history'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Historial / Dictadas ({historyClasses.length})
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b">
                            <tr>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Clase</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Fecha Clase</th>
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
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                        No hay clases en esta sección.
                                    </td>
                                </tr>
                            )}
                            {dataToDisplay.map((cls) => {
                                const invoice = cls.invoices?.[0]
                                let statusBadge
                                let estimatedPaymentDate = null
                                let isOverdue = false

                                if (invoice) {
                                    // Calculate estimated payment date
                                    // Assuming invoice issue date is close to class date or we just use class date + 30 business days if issue date not available
                                    // Ideally we use invoice.issue_date, falling back to class date
                                    const baseDate = invoice.issue_date || cls.date
                                    estimatedPaymentDate = calculatePaymentDate(baseDate, cls.date, cls.class_type)

                                    // Check if overdue: Not Paid AND Past Estimated Date
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
