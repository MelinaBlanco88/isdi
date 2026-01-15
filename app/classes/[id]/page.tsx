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
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">{classItem.class_name}</h1>
                    <div className="flex flex-wrap gap-4 text-slate-600">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200">
                            <Calendar size={16} />
                            <span>{format(new Date(classItem.date), 'EEEE d MMMM, yyyy', { locale: es })}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200">
                            <Clock size={16} />
                            <span>{classItem.time.slice(0, 5)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200">
                            {classItem.is_online ? <Laptop size={16} /> : <MapPin size={16} />}
                            <span>{classItem.is_online ? 'Online' : classItem.location}</span>
                        </div>
                    </div>
                </div>

                <ClassDetailsEditor classItem={classItem} />
            </div>
        </AppShell>
    )
}
