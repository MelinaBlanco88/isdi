'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateClassDetails(classId: string, formData: FormData) {
    const supabase = await createClient()

    const syllabus = formData.get('syllabus') as string
    const notes = formData.get('notes') as string
    const resources_link = formData.get('resources_link') as string

    const { error } = await supabase
        .from('classes')
        .update({ syllabus, notes, resources_link })
        .eq('id', classId)

    if (error) {
        return { error: 'Error al actualizar la clase' }
    }

    revalidatePath(`/classes/${classId}`)
    revalidatePath('/classes')
    return { success: true }
}
