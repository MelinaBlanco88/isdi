'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculatePaymentDate } from '@/utils/finance'
import { format } from 'date-fns'

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

    // 1. Update Class
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

    // 2. Sync Invoices (if any)
    // If the class has invoices, we must update their amount and re-calculate payment date
    // to keep data consistent.
    const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('class_id', classId)

    if (invoices && invoices.length > 0) {
        for (const inv of invoices) {
            // Recalculate payment date based on potentially new class date/type
            // We use the invoice's original issue date
            const newPaymentDate = calculatePaymentDate(inv.invoice_date, date, class_type)

            await supabase
                .from('invoices')
                .update({
                    amount: total_amount,
                    expected_payment_date: format(newPaymentDate, 'yyyy-MM-dd')
                })
                .eq('id', inv.id)
        }
    }

    revalidatePath(`/classes/${classId}`)
    revalidatePath('/classes')
    revalidatePath('/') // Dashboard
    return { success: true }
}
