'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateClassDetails(classId: string, formData: FormData) {
    const supabase = await createClient()

    const syllabus = formData.get('syllabus') as string
    const notes = formData.get('notes') as string
    const resources_link = formData.get('resources_link') as string

    // Core fields
    const class_name = formData.get('class_name') as string
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    const location = formData.get('location') as string
    const is_online = formData.get('is_online') === 'on'
    const class_hours = Number(formData.get('class_hours'))
    const hourly_rate = Number(formData.get('hourly_rate'))
    const total_amount = Number(formData.get('total_amount'))
    const class_type = formData.get('class_type') as string

    const { error } = await supabase
        .from('classes')
        .update({
            syllabus,
            notes,
            resources_link,
            class_name,
            date,
            time,
            location,
            is_online,
            class_hours,
            hourly_rate,
            total_amount,
            class_type
        })
        .eq('id', classId)

    if (error) {
        return { error: 'Error al actualizar la clase' }
    }

    revalidatePath(`/classes/${classId}`)
    revalidatePath('/classes')
    return { success: true }
}
