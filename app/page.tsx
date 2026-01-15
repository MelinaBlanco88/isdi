import { createClient } from '@/utils/supabase/server'
import { DollarSign, Clock, Wallet } from 'lucide-react'
import StatCard from '@/components/dashboard/StatCard'
import ClassTable from '@/components/classes/ClassTable'
import NewClassForm from '@/components/classes/NewClassForm'
import AppShell from '@/components/layout/AppShell'
import AnalyticsSection from '@/components/dashboard/AnalyticsSection'

import OverdueAlert from '@/components/dashboard/OverdueAlert'
import { calculatePaymentDate } from '@/utils/finance'
import { isPast } from 'date-fns'

function calculateStats(classes: any[]) {
  let totalPaid = 0
  let totalPending = 0
  let overdueCount = 0
  let totalOverdueAmount = 0

  classes?.forEach(cls => {
    if (cls.invoices && cls.invoices.length > 0) {
      const invoice = cls.invoices[0]
      const amount = Number(invoice.amount) || 0

      if (invoice.is_paid) {
        totalPaid += amount
      } else {
        totalPending += amount

        // Check for overdue
        // Assuming we use invoice.issue_date or fallback to class date (similar to ClassTable logic)
        // Ideally logic should be centralized but doing it here for the summary stats
        const baseDate = invoice.issue_date || cls.date
        const estimatedPaymentDate = calculatePaymentDate(baseDate, cls.date, cls.class_type)

        if (isPast(estimatedPaymentDate)) {
          overdueCount++
          totalOverdueAmount += amount
        }
      }
    }
  })

  return { totalPaid, totalPending, total: totalPaid + totalPending, overdueCount, totalOverdueAmount }
}


export default async function Dashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch classes with invoices
  const { data: classes } = await supabase
    .from('classes')
    .select('*, invoices(*)')
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  const { totalPaid, totalPending, total, overdueCount, totalOverdueAmount } = calculateStats(classes || [])

  return (
    <AppShell>
      <div className="flex flex-col gap-8">

        {/* Overdue Alert */}
        <OverdueAlert overdueCount={overdueCount} totalOverdueAmount={totalOverdueAmount} />

        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500">Bienvenido de nuevo, aquí está tu resumen financiero.</p>
          </div>
          <NewClassForm />
        </div>

        {/* KPI Cards */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Ingresos Totales"
            value={`$${totalPaid.toFixed(2)}`}
            icon={Wallet}
            color="green"
          />
          <StatCard
            label="Pendiente de Cobro"
            value={`$${totalPending.toFixed(2)}`}
            icon={Clock}
            color="orange"
          />
          <StatCard
            label="Proyección Total"
            value={`$${total.toFixed(2)}`}
            icon={DollarSign}
            color="blue"
          />
        </div>

        {/* Analytics Section */}
        <AnalyticsSection classes={classes || []} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Clases Recientes</h2>
          </div>
          <ClassTable classes={classes || []} />
        </div>
      </div>
    </AppShell>
  )
}
