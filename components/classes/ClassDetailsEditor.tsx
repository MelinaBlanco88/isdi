'use client'

import { useState, useEffect } from 'react'
import { updateClassDetails } from '@/app/actions/class-details'
import { Save, Loader2, Calendar, Clock, MapPin, Laptop, Timer, DollarSign, Lock, Unlock, FileText, Link as LinkIcon } from 'lucide-react'

export default function ClassDetailsEditor({ classItem }: { classItem: any }) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    // Core State
    const [classType, setClassType] = useState(classItem.class_type || 'open')

    // Pricing State
    const [hours, setHours] = useState<string>(classItem.class_hours?.toString() || '0')
    const [rate, setRate] = useState<string>(classItem.hourly_rate?.toString() || '0')
    const [manualTotal, setManualTotal] = useState<boolean>(false)

    // Calculation State
    const [subtotal, setSubtotal] = useState<number>(0)
    const [iva, setIva] = useState<number>(0)
    const [retIva, setRetIva] = useState<number>(0)
    const [retIsr, setRetIsr] = useState<number>(0)
    const [netTotal, setNetTotal] = useState<number>(classItem.total_amount || 0)

    useEffect(() => {
        if (manualTotal) return

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
    }, [hours, rate, manualTotal])

    async function clientAction(formData: FormData) {
        setLoading(true)
        setSuccess(false)

        // Ensure manual total is sent if enabled
        if (manualTotal) {
            formData.set('total_amount', netTotal.toString())
        } else {
            // Re-calculate to be safe or trust the state? Trust state for now but ensure it's in the form
            formData.set('total_amount', netTotal.toString())
        }
        formData.set('class_type', classType)

        await updateClassDetails(classItem.id, formData)
        setLoading(false)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
    }

    return (
        <form action={clientAction} className="space-y-6">

            {/* General Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-slate-800">Información General</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre de la clase</label>
                        <input
                            type="text"
                            name="class_name"
                            defaultValue={classItem.class_name}
                            required
                            className="w-full border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                            <Calendar size={14} /> Fecha
                        </label>
                        <input
                            type="date"
                            name="date"
                            defaultValue={classItem.date}
                            required
                            className="w-full border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                            <Clock size={14} /> Hora
                        </label>
                        <input
                            type="time"
                            name="time"
                            defaultValue={classItem.time}
                            required
                            className="w-full border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                            <MapPin size={14} /> Lugar / Link
                        </label>
                        <input
                            type="text"
                            name="location"
                            defaultValue={classItem.location}
                            placeholder="Ej. Sala C, Edificio 1"
                            className="w-full border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    <div className="flex items-end pb-2.5">
                        <div className="flex items-center gap-3 w-full">
                            <input
                                type="checkbox"
                                name="is_online"
                                id="edit_is_online"
                                defaultChecked={classItem.is_online}
                                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-4 w-4"
                            />
                            <label htmlFor="edit_is_online" className="text-sm font-medium text-slate-700 flex items-center gap-2 cursor-pointer select-none">
                                <Laptop size={16} className="text-slate-500" /> Es una clase Online
                            </label>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Tipo de Programa</label>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setClassType('open')}
                            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${classType === 'open'
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            Programa Abierto
                        </button>
                        <button
                            type="button"
                            onClick={() => setClassType('in_company')}
                            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${classType === 'in_company'
                                ? 'bg-purple-50 border-purple-200 text-purple-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            In Company
                        </button>
                    </div>
                </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-1 bg-green-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-slate-800">Cotización y Pagos</h3>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                            <Timer size={12} /> Horas Dictadas
                        </label>
                        <input
                            type="number"
                            name="class_hours"
                            min="0"
                            step="0.5"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow bg-white"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                            <DollarSign size={12} /> Tarifa por Hora
                        </label>
                        <input
                            type="number"
                            name="hourly_rate"
                            min="0"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow bg-white"
                        />
                    </div>
                </div>

                {/* Tax Breakdown Preview */}
                <div className="pt-4 border-t border-slate-200/60 space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Subtotal (Horas * Tarifa):</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>+ IVA (16%):</span>
                        <span>${iva.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-red-500">
                        <span>- Ret. IVA (10.6667%):</span>
                        <span>-${retIva.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-red-500">
                        <span>- Ret. ISR (10%):</span>
                        <span>-${retIsr.toFixed(2)}</span>
                    </div>

                    <div className="flex flex-col gap-2 pt-4 border-t border-slate-200 mt-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-900">Total Neto a Pagar:</span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setManualTotal(!manualTotal)}
                                    className={`p-1.5 rounded-md transition-colors ${manualTotal ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}
                                    title={manualTotal ? "Edición manual habilitada" : "Cálculo automático"}
                                >
                                    {manualTotal ? <Unlock size={14} /> : <Lock size={14} />}
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={netTotal}
                                readOnly={!manualTotal}
                                onChange={(e) => setNetTotal(parseFloat(e.target.value) || 0)}
                                className={`w-full pl-7 pr-3 py-3 rounded-lg text-lg font-bold text-right transition-all ${manualTotal
                                        ? 'bg-orange-50/50 border-orange-300 text-orange-700 focus:ring-2 focus:ring-orange-500'
                                        : 'bg-slate-100 border-transparent text-slate-700 focus:ring-0'
                                    }`}
                            />
                        </div>
                        {manualTotal && (
                            <p className="text-[10px] text-orange-600 text-right">
                                * El monto ha sido modificado manualmente y no se actualizará con horas/tarifa.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content & Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-slate-800">Temario / Syllabus</h3>
                    </div>
                    <textarea
                        name="syllabus"
                        defaultValue={classItem.syllabus || ''}
                        placeholder="Describe los temas a tratar en esta sesión..."
                        className="w-full min-h-[150px] border-slate-200 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-1 bg-orange-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-slate-800">Notas y Recursos</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                <LinkIcon size={14} /> Link a Recursos
                            </label>
                            <input
                                type="url"
                                name="resources_link"
                                defaultValue={classItem.resources_link || ''}
                                placeholder="Drive, Miro, Notion..."
                                className="w-full border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                <FileText size={14} /> Notas Privadas
                            </label>
                            <textarea
                                name="notes"
                                defaultValue={classItem.notes || ''}
                                placeholder="Notas internas..."
                                className="w-full min-h-[80px] border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-4 z-40 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl flex items-center justify-between">
                <div className="text-sm text-slate-500 pl-2">
                    {success ? (
                        <span className="text-green-600 font-medium flex items-center gap-2">
                            <CheckCircleIcon /> Cambios guardados correctamente
                        </span>
                    ) : (
                        <span>Recuerda guardar los cambios antes de salir.</span>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all font-medium shadow-lg shadow-slate-200"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Guardar Todo
                </button>
            </div>
        </form>
    )
}

function CheckCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    )
}
