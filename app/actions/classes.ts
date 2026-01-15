'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createClass(formData: FormData) {
    const supabase = await createClient()

    const rawData = {
        class_name: formData.get('class_name'),
        date: formData.get('date'),
        time: formData.get('time'),
        location: formData.get('location'),
        is_online: formData.get('is_online') === 'on',
        class_hours: Number(formData.get('class_hours')),
        hourly_rate: Number(formData.get('hourly_rate')),
        total_amount: Number(formData.get('total_amount')),
        class_type: formData.get('class_type'),
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const { error } = await supabase.from('classes').insert({
        ...rawData,
        user_id: user.id
    })

    if (error) {
        console.error('Error creating class:', error)
        // In a real app, handle error visibly
        return { error: 'Error creating class' }
    }

    revalidatePath('/')
    return { success: true }
}

export async function markAsCompleted(classId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('classes')
        .update({ class_completed: true })
        .eq('id', classId)

    if (error) {
        console.error('Error updating class:', error)
        return { error: 'Error updating class' }
    }

    revalidatePath('/')
    return { success: true }
}

export async function deleteClass(classId: string) {
    const supabase = await createClient()

    // Assuming standard cascade delete is not set up or handled by DB, 
    // we try to delete. Supabase RLS policies should govern access.
    const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)

    if (error) {
        console.error('Error deleting class:', error)
        return { error: 'Error deleting class' }
    }

    revalidatePath('/')
    return { success: true }
}
