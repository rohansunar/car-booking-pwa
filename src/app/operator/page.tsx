import { Suspense } from 'react'
import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import OperatorDashboard from '@/src/app/components/operator-dashboard'

export default function OperatorPage() {
  return (
    <Suspense fallback={<OperatorDashboardFallback />}>
      <OperatorDashboardContent />
    </Suspense>
  )
}

async function OperatorDashboardContent() {
  await connection()

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect('/login')

  const email = typeof data.claims.email === 'string' ? data.claims.email : ''
  const name = typeof data.claims.name === 'string' ? data.claims.name : ''

  return <OperatorDashboard operatorEmail={email} operatorName={name} />
}

function OperatorDashboardFallback() {
  return (
    <main className="min-h-screen bg-[#f5f7f4] text-[#18332c]" aria-busy="true" aria-live="polite">
      <header className="border-b border-[#e2e9e3] bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-5 py-4 sm:px-8">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d493d] text-lg font-bold text-white">R</span>
          <span className="text-lg font-bold">RideBook <span className="font-medium text-[#829087]">Operator</span></span>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[220px_1fr] lg:py-10">
        <aside className="hidden space-y-3 lg:block" aria-hidden="true">
          <div className="h-4 w-20 rounded bg-[#e2e9e3]" />
          <div className="h-11 rounded-xl bg-[#e6eee9]" />
          <div className="h-11 rounded-xl bg-white" />
          <div className="h-11 rounded-xl bg-white" />
          <div className="h-11 rounded-xl bg-white" />
        </aside>
        <section>
          <p className="text-sm font-semibold text-[#71917f]">Operator workspace</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Loading your dashboard…</h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {['Vehicles', 'Bookings', 'Upcoming trips'].map((label) => (
              <div key={label} className="rounded-2xl border border-[#e2e9e3] bg-white p-5">
                <p className="text-sm font-semibold text-[#718078]">{label}</p>
                <div className="mt-4 h-9 w-14 rounded-lg bg-[#edf4ef]" aria-hidden="true" />
                <div className="mt-2 h-3 w-24 rounded bg-[#f0f3f0]" aria-hidden="true" />
              </div>
            ))}
          </div>
          <div className="mt-6 min-h-48 rounded-2xl border border-[#e2e9e3] bg-white p-5 sm:p-6">
            <div className="h-5 w-40 rounded bg-[#edf4ef]" aria-hidden="true" />
            <div className="mt-6 space-y-3" aria-hidden="true">
              <div className="h-12 rounded-xl bg-[#f7f9f7]" />
              <div className="h-12 rounded-xl bg-[#f7f9f7]" />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
