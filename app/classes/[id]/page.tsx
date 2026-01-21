import { createClient } from '@/utils/supabase/server'
import AppShell from '@/components/layout/AppShell'
import ClassDetailsEditor from '@/components/classes/ClassDetailsEditor'
import { ArrowLeft, Calendar, Clock, MapPin, Laptop } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const { id } = resolvedParams

    const supabase = await createClient()

    const { data: classItem } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .single()

    if (!classItem) {
        return (
            <AppShell>
                <div className="text-center py-20">Clase no encontrada</div>
            </AppShell>
        )
    }

    return (
        <AppShell>
            <div className="max-w-4xl mx-auto pb-20">
                {/* Navigation */}
                <Link href="/classes" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                    <ArrowLeft size={18} />
                    Volver a mis clases
                </Link>

                {/* Header Class Info */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">{classItem.class_name}</h1>
                    <p className="text-slate-500">Administra los detalles, temario y facturación de esta clase.</p>
                </div>

                <ClassDetailsEditor classItem={classItem} />
            </div>
        </AppShell>
    )
}
