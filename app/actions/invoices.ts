'use server'

import { createClient } from '@/utils/supabase/server'
import { calculatePaymentDate } from '@/utils/finance'
import { format } from 'date-fns'
import { revalidatePath } from 'next/cache'

export async function createInvoice(formData: FormData) {
    const supabase = await createClient()

    const classId = formData.get('class_id') as string
    const invoiceDateStr = formData.get('invoice_date') as string
    const filePath = formData.get('file_path') as string // Path returned after client-side upload
    const amountStr = formData.get('amount') as string

    if (!classId || !invoiceDateStr || !filePath || !amountStr) {
        return { error: 'Missing required fields' }
    }

    const amount = parseFloat(amountStr)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthenticated' }

    // Get public URL (optional, or just store path)
    const { data: { publicUrl } } = supabase.storage
        .from('invoices')
        .getPublicUrl(filePath)

    // Fetch class details for payment date calculation
    const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('date, class_type')
        .eq('id', classId)
        .single()

    if (classError || !classData) {
        return { error: 'Class not found' }
    }

    // Calculate expected payment date
    const expectedDate = calculatePaymentDate(invoiceDateStr, classData.date, classData.class_type)
    const expectedDateStr = format(expectedDate, 'yyyy-MM-dd')

    const { error } = await supabase.from('invoices').insert({
        class_id: classId,
        user_id: user.id,
        invoice_date: invoiceDateStr,
        expected_payment_date: expectedDateStr,
        invoice_file_url: publicUrl,
        is_paid: false,
        amount: amount
    })

    if (error) {
        console.error('Error creating invoice:', error)
        return { error: 'Failed to create invoice' }
    }

    revalidatePath('/')
    return { success: true }
}

export async function markInvoiceAsPaid(invoiceId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('invoices')
        .update({ is_paid: true })
        .eq('id', invoiceId)

    if (error) {
        return { error: 'Failed to update invoice' }
    }

    revalidatePath('/')
    return { success: true }
}
