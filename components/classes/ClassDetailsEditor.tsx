'use client'

import { useState } from 'react'
import { updateClassDetails } from '@/app/actions/class-details'
import { Save, Loader2 } from 'lucide-react'

export default function ClassDetailsEditor({ classItem }: { classItem: any }) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function clientAction(formData: FormData) {
        setLoading(true)
        setSuccess(false)
        await updateClassDetails(classItem.id, formData)
        setLoading(false)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
    }

    return (
        <form action={clientAction} className="space-y-6">
            {/* Card for Syllabus */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Temario / Contenido</h3>
                <textarea
                    name="syllabus"
                    defaultValue={classItem.syllabus || ''}
                    placeholder="Describe los temas a tratar en esta sesión..."
                    className="w-full min-h-[150px] border-slate-200 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
            </div>

            {/* Card for Notes & Resources */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Notas y Recursos</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Link a Recursos (Drive/Miro)</label>
                        <input
                            type="url"
                            name="resources_link"
                            defaultValue={classItem.resources_link || ''}
                            placeholder="https://..."
                            className="w-full border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas Privadas</label>
                        <textarea
                            name="notes"
                            defaultValue={classItem.notes || ''}
                            placeholder="Notas para recordar, asistencia, ideas..."
                            className="w-full min-h-[100px] border-slate-200 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>
                </div>
            </div>

            {/* Floating or Fixed Save Button area */}
            <div className="flex items-center justify-end gap-4">
                {success && <span className="text-green-600 text-sm font-medium animate-in fade-in">¡Guardado correctamente!</span>}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all font-medium"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Guardar Cambios
                </button>
            </div>
        </form>
    )
}
