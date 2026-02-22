'use client'

import { createClass } from '@/app/actions/classes'
import { useRef, useState, useEffect } from 'react'
import { Plus, X, MapPin, Calendar, Clock, Laptop, DollarSign, Timer, BookOpen, Sparkles, TrendingUp } from 'lucide-react'

export default function NewClassForm() {
    const formRef = useRef<HTMLFormElement>(null)
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    // Pricing State
    const [hours, setHours] = useState<string>('')
    const [rate, setRate] = useState<string>('1900')

    // Calculation State
    const [subtotal, setSubtotal] = useState<number>(0)
    const [iva, setIva] = useState<number>(0)
    const [retIva, setRetIva] = useState<number>(0)
    const [retIsr, setRetIsr] = useState<number>(0)
    const [netTotal, setNetTotal] = useState<number>(0)

    // Class Type State
    const [classType, setClassType] = useState('open') // 'open' | 'in_company'

    useEffect(() => {
        const h = parseFloat(hours) || 0
        const r = parseFloat(rate) || 0

        const calculatedSubtotal = h * r
        const calculatedIva = calculatedSubtotal * 0.16
        const calculatedRetIva = calculatedSubtotal * 0.106667
        const calculatedRetIsr = calculatedSubtotal * 0.10

        const calculatedNet = calculatedSubtotal + calculatedIva - calculatedRetIva - calculatedRetIsr

        setSubtotal(calculatedSubtotal)
        setIva(calculatedIva)
        setRetIva(calculatedRetIva)
        setRetIsr(calculatedRetIsr)
        setNetTotal(calculatedNet)
    }, [hours, rate])

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    async function clientAction(formData: FormData) {
        setLoading(true)
        formData.set('total_amount', netTotal.toString())
        formData.set('class_type', classType)

        await createClass(formData)
        setIsOpen(false)
        setLoading(false)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
                <Plus size={20} />
                <span className="font-medium">Nueva Clase</span>
            </button>
        )
    }

    const fmt = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false) }}
        >
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200/50 my-0 sm:my-8 flex flex-col max-h-screen sm:max-h-[90vh]">

                {/* Fixed Header */}
                <div className="shrink-0 px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-900 rounded-xl text-white">
                            <BookOpen size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Programar Clase</h2>
                            <p className="text-xs text-slate-400">Agrega una nueva sesión a tu calendario</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    <form ref={formRef} action={clientAction} className="p-6 space-y-6">

                        {/* Class Name */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Nombre de la clase / Tema
                            </label>
                            <input
                                type="text"
                                name="class_name"
                                required
                                placeholder="Ej. Estrategia Digital - Módulo 3"
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-300 bg-white hover:border-slate-300"
                            />
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-400" /> Fecha
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-slate-300"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Clock size={14} className="text-slate-400" /> Hora
                                </label>
                                <input
                                    type="time"
                                    name="time"
                                    required
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-slate-300"
                                />
                            </div>
                        </div>

                        {/* Program Type */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-3">Tipo de Programa</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setClassType('open')
                                        setRate('1900')
                                    }}
                                    className={`relative py-4 px-4 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer text-left ${classType === 'open'
                                        ? 'bg-blue-50 border-blue-400 text-blue-700 ring-1 ring-blue-200'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles size={14} className={classType === 'open' ? 'text-blue-500' : 'text-slate-400'} />
                                        Programa Abierto
                                    </div>
                                    <span className="block text-xs font-normal opacity-70">$1,900 / hr</span>
                                    {classType === 'open' && (
                                        <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-blue-200"></div>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setClassType('in_company')
                                        setRate('4200')
                                    }}
                                    className={`relative py-4 px-4 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer text-left ${classType === 'in_company'
                                        ? 'bg-violet-50 border-violet-400 text-violet-700 ring-1 ring-violet-200'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <TrendingUp size={14} className={classType === 'in_company' ? 'text-violet-500' : 'text-slate-400'} />
                                        In Company
                                    </div>
                                    <span className="block text-xs font-normal opacity-70">$4,200 / hr</span>
                                    {classType === 'in_company' && (
                                        <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-violet-500 rounded-full ring-2 ring-violet-200"></div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-5 rounded-xl border border-slate-200 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign size={15} className="text-emerald-600" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cotización</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                        <Timer size={11} /> Horas
                                    </label>
                                    <input
                                        type="number"
                                        name="class_hours"
                                        min="0"
                                        step="0.5"
                                        placeholder="0"
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white hover:border-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                        <DollarSign size={11} /> $/Hora
                                    </label>
                                    <input
                                        type="number"
                                        name="hourly_rate"
                                        min="0"
                                        placeholder="0"
                                        value={rate}
                                        onChange={(e) => setRate(e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white hover:border-slate-300"
                                    />
                                </div>
                            </div>

                            {/* Tax Breakdown */}
                            {subtotal > 0 && (
                                <div className="pt-3 border-t border-slate-200/80 space-y-1.5">
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Subtotal:</span>
                                        <span className="font-mono">${fmt(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>+ IVA (16%):</span>
                                        <span className="font-mono">${fmt(iva)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-red-400">
                                        <span>- Ret. IVA (10.67%):</span>
                                        <span className="font-mono">-${fmt(retIva)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-red-400">
                                        <span>- Ret. ISR (10%):</span>
                                        <span className="font-mono">-${fmt(retIsr)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-slate-900 pt-3 border-t border-slate-200 mt-1">
                                        <span>Total Neto a Recibir:</span>
                                        <span className="text-emerald-600 font-mono text-base">${fmt(netTotal)}</span>
                                    </div>
                                </div>
                            )}

                            <input type="hidden" name="total_amount" value={netTotal} />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                <MapPin size={14} className="text-slate-400" /> Lugar / Link
                            </label>
                            <input
                                type="text"
                                name="location"
                                placeholder="Ej. Sala C, Edificio 1 / Zoom Link"
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-300 hover:border-slate-300"
                            />
                        </div>

                        {/* Online Toggle */}
                        <label htmlFor="is_online" className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition-all select-none group">
                            <input
                                type="checkbox"
                                name="is_online"
                                id="is_online"
                                className="rounded-md border-slate-300 text-slate-900 focus:ring-slate-900 h-4.5 w-4.5 cursor-pointer"
                            />
                            <div className="flex items-center gap-2 flex-1">
                                <Laptop size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                                <span className="text-sm font-medium text-slate-700">Es una clase Online</span>
                            </div>
                        </label>

                        {/* Footer Actions */}
                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-5 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                disabled={loading}
                                type="submit"
                                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} />
                                        Programar Clase
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
