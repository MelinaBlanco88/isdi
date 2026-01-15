import { createClient } from '@/utils/supabase/server'
import AppShell from '@/components/layout/AppShell'
import { User, Mail, Bell, Shield } from 'lucide-react'

export default async function SettingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    return (
        <AppShell>
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
                    <p className="text-slate-500">Administra tu perfil y preferencias de la cuenta.</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                            <User size={18} /> Perfil de Usuario
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-600">
                                    <Mail size={16} />
                                    <span className="text-sm font-medium">{user.email}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">ID de Usuario</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-600">
                                    <Shield size={16} />
                                    <span className="text-sm font-mono truncate">{user.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preferences Placeholder */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden opacity-60">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Bell size={18} /> Notificaciones (Próximamente)
                        </h2>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-slate-500">
                            Las opciones para configurar recordatorios de pago y alertas de clases estarán disponibles pronto.
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-sm text-blue-800 text-center">
                        ¿Necesitas ayuda? Contacta a soporte en <strong>soporte@isdi.edu</strong>
                    </p>
                </div>

            </div>
        </AppShell>
    )
}
