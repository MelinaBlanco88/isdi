import { createClient } from '@/utils/supabase/server'
import AppShell from '@/components/layout/AppShell'
import ClassTable from '@/components/classes/ClassTable'
import NewClassForm from '@/components/classes/NewClassForm'

export default async function ClassesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Fetch all classes
    const { data: classes } = await supabase
        .from('classes')
        .select('*, invoices(*)')
        .order('date', { ascending: false })
        .order('time', { ascending: false })

    return (
        <AppShell>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Mis Clases</h1>
                        <p className="text-slate-500">Gestiona tu historial de clases y sesiones futuras.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    <div className="xl:col-span-3">
                        <ClassTable classes={classes || []} />
                    </div>

                    <div className="xl:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-4">
                            <h3 className="font-semibold text-slate-800 mb-4">Acciones</h3>
                            <NewClassForm />

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <p className="text-xs text-slate-400">
                                    Aquí puedes ver todas tus clases registradas. Usa el botón "Nueva Clase" para agendar una sesión.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    )
}
