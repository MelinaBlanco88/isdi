'use client'

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    LineChart,
    Line
} from 'recharts'
import { useMemo } from 'react'
import { format, parseISO, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AnalyticsSection({ classes }: { classes: any[] }) {

    const stats = useMemo(() => {
        // Group by month
        const monthlyData: Record<string, any> = {}

        classes.forEach(cls => {
            const date = parseISO(cls.date)
            const monthKey = format(startOfMonth(date), 'yyyy-MM')
            const monthLabel = format(date, 'MMM yyyy', { locale: es })

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    name: monthLabel,
                    totalIncome: 0,
                    pendingIncome: 0,
                    paidIncome: 0,
                    hours: 0,
                    count: 0
                }
            }

            const amount = cls.total_amount || 0
            const hours = cls.class_hours || 0

            // Check invoice status
            const isPaid = cls.invoices?.some((inv: any) => inv.is_paid)
            const hasInvoice = cls.invoices && cls.invoices.length > 0

            monthlyData[monthKey].totalIncome += amount
            monthlyData[monthKey].hours += hours
            monthlyData[monthKey].count += 1

            if (isPaid) {
                monthlyData[monthKey].paidIncome += amount
            } else {
                monthlyData[monthKey].pendingIncome += amount
            }
        })

        return Object.entries(monthlyData)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([_, data]) => ({
                ...data,
                avgRate: data.hours > 0 ? (data.totalIncome / data.hours).toFixed(0) : 0
            }))
    }, [classes])

    if (stats.length === 0) return null

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Income Evolution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Evolución de Ingresos</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`$${value?.toFixed(2)}`, '']}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="totalIncome"
                                    name="Facturado Total"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="paidIncome"
                                    name="Cobrado Real"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPaid)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Workload Analysis */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Carga de Trabajo (Horas)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="hours"
                                    name="Horas Dictadas"
                                    fill="#6366f1"
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Rate Trend & Class Count */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Rate Trend Small Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2">
                    <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">Tendencia de Tarifa Promedio ($/hr)</h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" hide />
                                <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="avgRate"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Summary Box */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-center">
                    <h4 className="text-slate-400 text-sm font-medium mb-2">Total Clases Registradas</h4>
                    <div className="text-5xl font-bold mb-4">
                        {classes.length}
                    </div>

                    <div className="flex gap-4 mt-2 pt-4 border-t border-slate-700/50">
                        <div>
                            <p className="text-xs text-slate-400 uppercase">Abierto</p>
                            <p className="text-lg font-semibold text-blue-400">
                                {classes.filter(c => c.class_type === 'open' || !c.class_type).length}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase">In Company</p>
                            <p className="text-lg font-semibold text-purple-400">
                                {classes.filter(c => c.class_type === 'in_company').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
