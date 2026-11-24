'use client'

import { useCallback, useMemo, useState, useSyncExternalStore, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import Link from 'next/link'
import rides from '@/src/data/rides.json'
import vehicleLayouts from '@/src/data/vehicle-layouts.json'
import sampleBookingData from '@/src/data/operator-bookings.json'

type SeatPrice = { seatId: string; price: number }
type Vehicle = {
  id: string
  name: string
  registration: string
  capacity: number
  capacityIncludesDriver: boolean
  routes: string[]
  details: string
  seatPrices: SeatPrice[]
  isSample?: boolean
}
type Booking = {
  id: string
  reference: string
  rideId: string
  vehicleLabel: string
  customerName: string
  customerEmail: string
  customerPhone: string
  from: string
  to: string
  date: string
  departure: string
  seats: SeatPrice[]
  total: number
  status: string
  isSample?: boolean
}
const VEHICLES_KEY = 'ridebook.operator.vehicles'
const BOOKINGS_KEY = 'ridebook.operator.bookings'
const PROFILE_KEY = 'ridebook.operator.profile'
const STORAGE_EVENT = 'ridebook:local-storage-change'

function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(STORAGE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(STORAGE_EVENT, callback)
  }
}

function useBrowserStorage<T>(key: string, fallback: T) {
  const fallbackSnapshot = JSON.stringify(fallback)
  const getSnapshot = useCallback(
    () => window.localStorage.getItem(key) ?? fallbackSnapshot,
    [key, fallbackSnapshot]
  )
  const getServerSnapshot = useCallback(() => fallbackSnapshot, [fallbackSnapshot])
  const snapshot = useSyncExternalStore(subscribeToStorage, getSnapshot, getServerSnapshot)
  const value = useMemo(() => {
    try {
      return JSON.parse(snapshot) as T
    } catch {
      return fallback
    }
  }, [fallback, snapshot])
  const save = useCallback((nextValue: T) => {
    window.localStorage.setItem(key, JSON.stringify(nextValue))
    window.dispatchEvent(new Event(STORAGE_EVENT))
  }, [key])

  return [value, save] as const
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDate(date: string) {
  if (!date) return '—'
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function getLocalDateAfter(days: number) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createSampleVehicles(): Vehicle[] {
  return rides.map((ride) => ({
    id: ride.id,
    name: ride.vehicle,
    registration: 'Sample fleet vehicle',
    capacity: ride.capacity,
    capacityIncludesDriver: ride.capacityIncludesDriver,
    routes: [`${ride.from} → ${ride.to}`],
    details: `${ride.duration} · Departs ${ride.departure}`,
    seatPrices: ride.seats.map((seat) => ({ seatId: seat.id, price: seat.price })),
    isSample: true,
  }))
}

function createSampleBookings(): Booking[] {
  return sampleBookingData.map(({ daysFromToday, ...booking }) => ({
    ...booking,
    date: getLocalDateAfter(daysFromToday),
    isSample: true,
  }))
}

function capacityLabel(vehicle: Pick<Vehicle, 'capacity' | 'capacityIncludesDriver'>) {
  return vehicle.capacityIncludesDriver
    ? `${vehicle.capacity}-seater`
    : `${vehicle.capacity} passenger seats + driver`
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-[#355347]">
      {label}
      {children}
    </label>
  )
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`mt-2 min-h-11 w-full rounded-xl border border-[#dce5de] bg-white px-3 text-sm font-normal text-[#18332c] outline-none placeholder:text-[#a3aea8] focus:border-[#6e9e7e] focus:ring-2 focus:ring-[#dbeadf] ${props.className ?? ''}`}
    />
  )
}

function AddVehicleForm({ onSave, onCancel }: { onSave: (vehicle: Vehicle) => void; onCancel: () => void }) {
  const [capacity, setCapacity] = useState<keyof typeof vehicleLayouts>('5')
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const seatIds = vehicleLayouts[capacity].flat().filter((seatId) => seatId !== 'D')

  function handleCapacityChange(value: string) {
    setCapacity(value as keyof typeof vehicleLayouts)
    setPrices({})
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const routes = String(formData.get('routes') ?? '')
      .split('\n')
      .map((route) => route.trim())
      .filter(Boolean)
    if (routes.length === 0) {
      setError('Add at least one route, one per line.')
      return
    }

    const seatPrices = seatIds.map((seatId) => ({ seatId, price: Number(prices[seatId]) }))
    if (seatPrices.some((seat) => !Number.isFinite(seat.price) || seat.price <= 0)) {
      setError('Enter a price greater than zero for every passenger seat.')
      return
    }

    const registration = String(formData.get('registration') ?? '').trim()
    const id = `vehicle-${registration.toUpperCase().replace(/[^A-Z0-9]/g, '')}`
    onSave({
      id,
      name: String(formData.get('name') ?? '').trim(),
      registration,
      capacity: Number(capacity),
      capacityIncludesDriver: capacity !== '10',
      routes,
      details: String(formData.get('details') ?? '').trim(),
      seatPrices,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 rounded-2xl border border-[#dce7de] bg-[#f8faf8] p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Add a vehicle</h3>
          <p className="mt-1 text-sm text-[#718078]">Add vehicle details, routes, and a price for each passenger seat.</p>
        </div>
        <button type="button" onClick={onCancel} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#718078] hover:bg-white">Cancel</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vehicle name / model"><TextInput name="name" required placeholder="e.g. Force Traveller" /></Field>
        <Field label="Registration number"><TextInput name="registration" required placeholder="e.g. HP 01 AB 1234" /></Field>
        <Field label="Seat capacity">
          <select value={capacity} onChange={(event) => handleCapacityChange(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#dce5de] bg-white px-3 text-sm font-normal outline-none focus:border-[#6e9e7e]">
            {Object.keys(vehicleLayouts).map((value) => <option key={value} value={value}>{value === '10' ? '10 passenger seats + driver' : `${value}-seater layout`}</option>)}
          </select>
        </Field>
        <Field label="Vehicle details"><TextInput name="details" placeholder="AC, luggage space, model year…" /></Field>
        <div className="sm:col-span-2">
          <Field label="Routes (one per line, From → To)">
            <textarea name="routes" required rows={3} placeholder={'Chandigarh → Shimla\nShimla → Manali'} className="mt-2 w-full rounded-xl border border-[#dce5de] bg-white px-3 py-2.5 text-sm font-normal outline-none placeholder:text-[#a3aea8] focus:border-[#6e9e7e] focus:ring-2 focus:ring-[#dbeadf]" />
          </Field>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="font-semibold">Passenger seat prices</h4>
          <span className="text-xs text-[#7f8e85]">Driver seat is excluded</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {seatIds.map((seatId) => (
            <Field key={seatId} label={`Seat ${seatId} · ₹`}>
              <TextInput type="number" min="1" required value={prices[seatId] ?? ''} onChange={(event) => setPrices({ ...prices, [seatId]: event.target.value })} placeholder="Price per passenger" />
            </Field>
          ))}
        </div>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" className="rounded-xl bg-[#1d493d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#28604f]">Save vehicle</button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-[#dce5de] px-5 py-3 text-sm font-semibold text-[#496257] hover:bg-white">Cancel</button>
      </div>
    </form>
  )
}

export default function OperatorDashboard({ operatorEmail, operatorName }: { operatorEmail: string; operatorName: string }) {
  const [tab, setTab] = useState<'overview' | 'vehicles' | 'bookings' | 'profile'>('overview')
  const sampleVehicles = useMemo(() => createSampleVehicles(), [])
  const defaultProfile = useMemo(() => ({ name: operatorName, email: operatorEmail, phone: '', whatsapp: '' }), [operatorEmail, operatorName])
  const sampleBookings = useMemo(() => createSampleBookings(), [])
  const [vehicles, setVehicles] = useBrowserStorage(VEHICLES_KEY, sampleVehicles)
  const [bookings] = useBrowserStorage<Booking[]>(BOOKINGS_KEY, [])
  const [profile, setProfile] = useBrowserStorage(PROFILE_KEY, defaultProfile)
  const [addingVehicle, setAddingVehicle] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [bookingVehicleFilter, setBookingVehicleFilter] = useState('all')

  const allBookings = useMemo(() => [...sampleBookings, ...bookings], [bookings, sampleBookings])
  const upcomingBookings = useMemo(() => allBookings.filter((booking) => booking.date >= getLocalDateAfter(0)).length, [allBookings])
  const visibleBookings = useMemo(
    () => bookingVehicleFilter === 'all' ? allBookings : allBookings.filter((booking) => booking.rideId === bookingVehicleFilter),
    [allBookings, bookingVehicleFilter]
  )

  function saveVehicle(vehicle: Vehicle) {
    setVehicles([vehicle, ...vehicles])
    setAddingVehicle(false)
    setSavedMessage('Vehicle saved in this browser.')
    setTab('vehicles')
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setProfile({
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      whatsapp: String(formData.get('whatsapp') ?? ''),
    })
    setSavedMessage('Profile saved in this browser.')
  }

  const navItems = [
    { id: 'overview' as const, label: 'Overview', icon: '⌂' },
    { id: 'vehicles' as const, label: 'Vehicles & routes', icon: '▤' },
    { id: 'bookings' as const, label: 'Bookings', icon: '▣' },
    { id: 'profile' as const, label: 'My profile', icon: '◉' },
  ]

  return (
    <main className="min-h-screen bg-[#f5f7f4] text-[#18332c]">
      <header className="border-b border-[#e2e9e3] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d493d] text-lg font-bold text-white">R</span>
            <span className="text-lg font-bold">RideBook <span className="font-medium text-[#829087]">Operator</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[#6d7d74] sm:block">{profile.name || operatorEmail}</span>
            <form action="/auth/signout" method="post">
              <button className="rounded-xl border border-[#dce5de] px-4 py-2 text-sm font-semibold text-[#486255] hover:bg-[#f7f9f7]">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[220px_1fr] lg:py-10">
        <aside>
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9aa69e]">Workspace</p>
          <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Operator dashboard">
            {navItems.map((item) => (
              <button key={item.id} type="button" onClick={() => { setTab(item.id); setSavedMessage('') }} className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition ${tab === item.id ? 'bg-[#e6eee9] text-[#1d493d]' : 'text-[#6e7e75] hover:bg-white hover:text-[#1d493d]'}`}>
                <span className="w-5 text-center text-lg" aria-hidden="true">{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
          <div className="mt-8 hidden rounded-2xl border border-[#e2e9e3] bg-white p-4 lg:block">
            <p className="text-xs font-bold uppercase tracking-wider text-[#77917f]">Demo workspace</p>
            <p className="mt-2 text-xs leading-5 text-[#829087]">Demo information is stored in this browser only. Don’t enter real customer details.</p>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#71917f]">Operator workspace</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                {tab === 'overview' ? `Welcome${profile.name ? `, ${profile.name}` : ''}` : navItems.find((item) => item.id === tab)?.label}
              </h1>
            </div>
            <span className="rounded-full bg-[#fff5df] px-3 py-1.5 text-xs font-semibold text-[#8c6c2e]">Demo data · saved in this browser</span>
          </div>

          <>
              {tab === 'overview' && (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <SummaryCard label="Vehicles" value={vehicles.length} detail="In your fleet" icon="▤" />
                    <SummaryCard label="Bookings" value={allBookings.length} detail="Includes sample bookings" icon="▣" />
                    <SummaryCard label="Upcoming trips" value={upcomingBookings} detail="Confirmed demo bookings" icon="↗" />
                  </div>
                  <section className="mt-6 rounded-2xl border border-[#e2e9e3] bg-white p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div><h2 className="text-lg font-semibold">Recent bookings</h2><p className="mt-1 text-sm text-[#7c8982]">Customer details grouped by the selected vehicle.</p></div>
                      <button type="button" onClick={() => setTab('bookings')} className="text-sm font-semibold text-[#39725a] hover:underline">View all</button>
                    </div>
                    {allBookings.length ? <BookingList bookings={allBookings.slice(0, 4)} vehicles={vehicles} /> : <EmptyState title="No bookings yet" detail="Bookings created from the demo checkout will appear here." />}
                  </section>
                  <section className="mt-6 rounded-2xl border border-[#d8e6da] bg-[#edf5ef] p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div><h2 className="font-semibold">Manage your fleet</h2><p className="mt-1 text-sm text-[#6c8173]">Add routes, vehicle details, and individual passenger seat prices.</p></div>
                      <button type="button" onClick={() => { setTab('vehicles'); setAddingVehicle(true) }} className="rounded-xl bg-[#1d493d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#28604f]">Add a vehicle</button>
                    </div>
                  </section>
                </>
              )}

              {tab === 'vehicles' && (
                <>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-[#718078]">Routes and passenger seat prices for each vehicle.</p>
                    {!addingVehicle && <button type="button" onClick={() => setAddingVehicle(true)} className="rounded-xl bg-[#1d493d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#28604f]">+ Add vehicle</button>}
                  </div>
                  {addingVehicle && <AddVehicleForm onSave={saveVehicle} onCancel={() => setAddingVehicle(false)} />}
                  <div className="mt-5 grid gap-4">
                    {vehicles.map((vehicle) => {
                      const availablePrices = vehicle.seatPrices.map((seat) => seat.price).filter((price) => price > 0)
                      return (
                        <article key={vehicle.id} className="rounded-2xl border border-[#e2e9e3] bg-white p-5 shadow-sm sm:p-6">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{vehicle.name}</h2>{vehicle.isSample && <span className="rounded-full bg-[#f1f4f1] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#829087]">Sample</span>}</div>
                              <p className="mt-1 text-sm text-[#748279]">{vehicle.registration} · {capacityLabel(vehicle)}</p>
                            </div>
                            <div className="rounded-xl bg-[#eff5f0] px-3 py-2 text-right"><p className="text-[10px] font-bold uppercase tracking-wider text-[#78917f]">Seat fare range</p><p className="mt-0.5 text-sm font-bold text-[#1d493d]">{availablePrices.length ? `${formatPrice(Math.min(...availablePrices))} – ${formatPrice(Math.max(...availablePrices))}` : 'Not set'}</p></div>
                          </div>
                          <div className="mt-4 grid gap-4 border-t border-[#edf0ed] pt-4 sm:grid-cols-2">
                            <div><p className="text-xs font-bold uppercase tracking-wider text-[#91a097]">Routes</p><div className="mt-2 flex flex-wrap gap-2">{vehicle.routes.map((route) => <span key={route} className="rounded-lg bg-[#f4f7f4] px-2.5 py-1.5 text-sm text-[#52685c]">{route}</span>)}</div></div>
                            <div><p className="text-xs font-bold uppercase tracking-wider text-[#91a097]">Vehicle details</p><p className="mt-2 text-sm text-[#52685c]">{vehicle.details || 'No additional details'}</p></div>
                          </div>
                          <div className="mt-4 border-t border-[#edf0ed] pt-4"><p className="text-xs font-bold uppercase tracking-wider text-[#91a097]">Per-seat pricing</p><div className="mt-2 flex flex-wrap gap-2">{vehicle.seatPrices.map((seat) => <span key={seat.seatId} className="rounded-lg border border-[#e6ece7] px-2.5 py-1.5 text-xs text-[#53685c]">{seat.seatId} · {formatPrice(seat.price)}</span>)}</div></div>
                        </article>
                      )
                    })}
                    {!vehicles.length && <EmptyState title="No vehicles added" detail="Add a vehicle to start listing routes and seat fares." />}
                  </div>
                </>
              )}

              {tab === 'bookings' && (
                <section className="rounded-2xl border border-[#e2e9e3] bg-white p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><h2 className="text-lg font-semibold">Bookings by vehicle</h2><p className="mt-1 text-sm text-[#7c8982]">Customer contact, route, seats, and fare.</p></div>
                    <select value={bookingVehicleFilter} onChange={(event) => setBookingVehicleFilter(event.target.value)} className="min-h-10 rounded-xl border border-[#dce5de] bg-white px-3 text-sm text-[#52685c]">
                      <option value="all">All vehicles</option>
                      {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}
                    </select>
                  </div>
                  {visibleBookings.length ? <BookingList bookings={visibleBookings} vehicles={vehicles} /> : <EmptyState title="No bookings for this vehicle" detail="Completed demo bookings will show the customer name, email, phone, route, selected seats, and total fare here." />}
                </section>
              )}

              {tab === 'profile' && (
                <form key={`${profile.name}:${profile.email}:${profile.phone}:${profile.whatsapp}`} onSubmit={saveProfile} className="max-w-3xl rounded-2xl border border-[#e2e9e3] bg-white p-5 shadow-sm sm:p-7">
                  <div className="mb-6"><h2 className="text-lg font-semibold">Operator profile</h2><p className="mt-1 text-sm text-[#718078]">Keep your contact details up to date for your passengers.</p></div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Business name"><TextInput required name="name" autoComplete="name" defaultValue={profile.name} /></Field>
                    <Field label="Contact email"><TextInput required type="email" name="email" autoComplete="email" defaultValue={profile.email} /></Field>
                    <Field label="Phone number"><TextInput type="tel" name="phone" autoComplete="tel" defaultValue={profile.phone} placeholder="+91 98765 43210" /></Field>
                    <Field label="WhatsApp number"><TextInput type="tel" name="whatsapp" defaultValue={profile.whatsapp} placeholder="+91 98765 43210" /></Field>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-4"><button type="submit" className="rounded-xl bg-[#1d493d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#28604f]">Save profile</button>{savedMessage && <p role="status" className="text-sm font-medium text-[#39725a]">{savedMessage}</p>}</div>
                </form>
              )}
          </>
          {savedMessage && tab !== 'profile' && <p role="status" className="mt-4 text-sm font-medium text-[#39725a]">{savedMessage}</p>}
        </div>
      </div>
    </main>
  )
}

function SummaryCard({ label, value, detail, icon }: { label: string; value: number; detail: string; icon: string }) {
  return <article className="rounded-2xl border border-[#e2e9e3] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-[#718078]">{label}</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4ef] text-lg text-[#47745d]">{icon}</span></div><p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-[#8a978f]">{detail}</p></article>
}

function BookingList({ bookings, vehicles }: { bookings: Booking[]; vehicles: Vehicle[] }) {
  return (
    <div className="mt-5 space-y-3">
      {bookings.map((booking) => {
        const vehicle = vehicles.find((item) => item.id === booking.rideId)
        return (
          <article key={booking.id} className="rounded-xl border border-[#edf0ed] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><p className="font-semibold">{booking.customerName}</p>{booking.isSample && <span className="rounded-full bg-[#fff5df] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8c6c2e]">Sample</span>}<p className="w-full mt-1 text-xs text-[#829087]">{booking.reference} · {vehicle?.name ?? booking.vehicleLabel}</p></div>
              <span className="rounded-full bg-[#eaf4ec] px-2.5 py-1 text-xs font-semibold text-[#47745d]">{booking.status}</span>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-[#617269] sm:grid-cols-2">
              <p><span className="font-medium text-[#425b4d]">Contact:</span> {booking.customerPhone} · {booking.customerEmail}</p>
              <p><span className="font-medium text-[#425b4d]">Route:</span> {booking.from} → {booking.to}</p>
              <p><span className="font-medium text-[#425b4d]">Travel:</span> {formatDate(booking.date)} · {booking.departure}</p>
              <p><span className="font-medium text-[#425b4d]">Seats:</span> {booking.seats.map((seat) => `${seat.seatId} (${formatPrice(seat.price)})`).join(', ')}</p>
            </div>
            <p className="mt-3 border-t border-[#edf0ed] pt-3 text-right text-sm font-bold text-[#1d493d]">Total · {formatPrice(booking.total)}</p>
          </article>
        )
      })}
    </div>
  )
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="mt-5 rounded-2xl border border-dashed border-[#d5dfd7] bg-[#fafcfa] px-5 py-10 text-center"><h3 className="font-semibold">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#829087]">{detail}</p></div>
}
