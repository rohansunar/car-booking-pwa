'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import SeatPicker from '@/src/app/components/seat-picker'
import rides from '@/src/data/rides.json'

type Search = {
  from: string
  to: string
  date: string
  passengers: number
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

function formatDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(year, month - 1, day))
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

const popularRoutes = [
  ['Siliguri', 'Darjeeling'],
  ['Siliguri', 'Gangtok'],
  ['Siliguri', 'Kalimpong'],
  ['Siliguri', 'Kurseong'],
  ['Kurseong', 'Sonada'],
]

export default function HomePage() {
  const [search, setSearch] = useState<Search>({ from: '', to: '', date: '', passengers: 1 })
  const [submittedSearch, setSubmittedSearch] = useState<Search | null>(null)
  const [openRideId, setOpenRideId] = useState<string | null>(null)

  const results = submittedSearch
    ? rides.filter(
        (ride) =>
          ride.from.toLowerCase() === submittedSearch.from.trim().toLowerCase() &&
          ride.to.toLowerCase() === submittedSearch.to.trim().toLowerCase() &&
          getLocalDateAfter(ride.daysFromToday) === submittedSearch.date &&
          ride.seats.filter((seat) => seat.available).length >= submittedSearch.passengers
      )
    : []

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOpenRideId(null)
    setSubmittedSearch({ ...search, passengers: Math.max(1, search.passengers) })
  }

  function showSampleRoute(from: string, to: string) {
    const sampleRide = rides.find((ride) => ride.from === from && ride.to === to)
    if (!sampleRide) return

    const sampleSearch = {
      from,
      to,
      date: getLocalDateAfter(sampleRide.daysFromToday),
      passengers: 1,
    }
    setSearch(sampleSearch)
    setSubmittedSearch(sampleSearch)
    setOpenRideId(null)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f5ef] text-[#172b2a]">
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="RideBook home">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#173f3b] text-lg font-black text-[#f6d28b] shadow-lg shadow-[#173f3b]/15 transition group-hover:-rotate-6">R</span>
          <span className="text-xl font-extrabold tracking-tight text-[#173f3b]">RideBook<span className="text-[#d18a50]">.</span></span>
        </Link>
        <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d9ded5] bg-white/70 px-4 text-xs font-bold text-[#34504b] transition hover:border-[#bd8953] hover:bg-white sm:px-5 sm:text-sm">
          Operator login <span className="ml-2" aria-hidden="true">↗</span>
        </Link>
      </header>

      <section className="relative isolate mx-auto max-w-7xl px-4 pb-14 pt-5 sm:px-8 sm:pb-20 sm:pt-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-28 -z-10 h-[28rem] w-[28rem] rounded-full bg-[#edc78c]/30 blur-3xl sm:right-0 sm:top-0" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-44 top-64 -z-10 h-80 w-80 rounded-full bg-[#b8d0c2]/50 blur-3xl" />

        <div className="grid items-center gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-12">
          <div className="page-enter max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d9e3d9] bg-white/70 px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#47645a] shadow-sm sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-[#d99150] shadow-[0_0_0_4px_rgba(217,145,80,0.14)]" /> The hills are closer than you think
            </div>
            <h1 className="mt-5 max-w-xl text-[2.7rem] font-semibold leading-[1.04] tracking-[-0.055em] text-[#173f3b] sm:mt-6 sm:text-6xl lg:text-[4.4rem]">
              Take the scenic route<span className="text-[#d18a50]">.</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#637570] sm:mt-5 sm:text-lg sm:leading-8">
              Find your seat to Darjeeling, Gangtok and the places in between. Shared journeys, thoughtfully made.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[#536a61] sm:mt-7 sm:text-sm">
              <span className="inline-flex items-center gap-2"><span className="text-[#c47e42]">✦</span> Small group journeys</span>
              <span className="inline-flex items-center gap-2"><span className="text-[#c47e42]">✦</span> Pick your seat</span>
            </div>
          </div>

          <div aria-hidden="true" className="relative mx-auto w-full max-w-xl page-enter-delayed">
            <div className="mountain-art relative aspect-[1.3/1] overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-[#dce8da] via-[#e8e9d9] to-[#f1d4a7] shadow-[0_28px_80px_-38px_rgba(23,63,59,0.4)] sm:rounded-[2.5rem]">
              <div className="absolute left-[14%] top-[12%] h-16 w-16 rounded-full bg-[#f8e6bd] shadow-[0_0_70px_20px_rgba(248,230,189,0.65)] sm:h-24 sm:w-24" />
              <svg viewBox="0 0 640 470" className="absolute inset-0 h-full w-full" fill="none" preserveAspectRatio="xMidYMax slice">
                <path d="M0 275 113 144l54 61 89-112 114 147 77-88 193 156v162H0V275Z" fill="#9bb7a5" />
                <path d="m256 93 40 53-34-7-16 15-35-5 45-56Z" fill="#f5f3e9" />
                <path d="m370 240 77-88 193 156v162H129l123-150 64 28 54-108Z" fill="#577e70" />
                <path d="m448 152 25 37-24-8-15 14-27-7 41-36Z" fill="#f5f3e9" />
                <path d="M0 331c88-39 151-30 220 7 91 50 160 35 236-9 67-39 126-46 184-21v162H0V331Z" fill="#365e51" />
                <path d="M0 395c109-60 202-23 291 21 106 51 202 9 349-37v91H0v-75Z" fill="#234d45" />
                <path d="M0 427c100-42 195-25 283 13 87 37 214 25 357-15v45H0v-43Z" fill="#173f3b" />
                <path d="M90 470c75-33 145-25 209-9 74 18 147 13 249-25" stroke="#eacb91" strokeWidth="4" strokeLinecap="round" strokeDasharray="3 11" opacity=".9" />
              </svg>
              <div className="absolute bottom-4 left-4 rounded-2xl border border-white/70 bg-white/75 px-3.5 py-2.5 shadow-lg backdrop-blur-md sm:bottom-6 sm:left-6 sm:px-4">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.17em] text-[#74877c] sm:text-[10px]">Next stop</p>
                <p className="mt-0.5 text-sm font-bold text-[#173f3b] sm:text-base">The Eastern Himalaya</p>
              </div>
              <div className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-2xl border border-white/60 bg-white/50 text-lg text-[#34594d] shadow-sm backdrop-blur sm:right-6 sm:top-6 sm:h-14 sm:w-14 sm:text-xl">✧</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="search-panel page-enter-delayed-2 relative mx-auto mt-8 grid max-w-6xl gap-2 rounded-[1.75rem] border border-white bg-white/90 p-3 shadow-[0_24px_70px_-42px_rgba(20,52,48,0.42)] backdrop-blur-xl sm:mt-12 sm:grid-cols-2 sm:gap-3 sm:p-4 lg:grid-cols-[1.1fr_1.1fr_1fr_0.9fr_auto] lg:items-end lg:rounded-[2rem] lg:p-5">
          <label className="block rounded-2xl bg-[#f7f7f2] px-4 py-3 transition focus-within:ring-2 focus-within:ring-[#d18a50]/50">
            <span className="mb-1 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#87958b]"><span className="text-[#d18a50]">●</span> Leaving from</span>
            <input required list="ride-cities" value={search.from} onChange={(event) => setSearch({ ...search, from: event.target.value })} placeholder="Choose a city" className="min-h-7 w-full bg-transparent text-base font-bold text-[#173f3b] outline-none placeholder:font-medium placeholder:text-[#a6afa7]" />
          </label>
          <label className="block rounded-2xl bg-[#f7f7f2] px-4 py-3 transition focus-within:ring-2 focus-within:ring-[#d18a50]/50">
            <span className="mb-1 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#87958b]"><span className="text-[#d18a50]">●</span> Going to</span>
            <input required list="ride-cities" value={search.to} onChange={(event) => setSearch({ ...search, to: event.target.value })} placeholder="Choose a destination" className="min-h-7 w-full bg-transparent text-base font-bold text-[#173f3b] outline-none placeholder:font-medium placeholder:text-[#a6afa7]" />
          </label>
          <label className="block rounded-2xl bg-[#f7f7f2] px-4 py-3 transition focus-within:ring-2 focus-within:ring-[#d18a50]/50">
            <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#87958b]">Travel date</span>
            <input required type="date" value={search.date} onChange={(event) => setSearch({ ...search, date: event.target.value })} className="min-h-7 w-full bg-transparent text-base font-bold text-[#173f3b] outline-none" />
          </label>
          <div className="flex min-h-[4.25rem] items-center justify-between rounded-2xl bg-[#f7f7f2] px-4 py-2.5" aria-label="Number of passengers">
            <div><span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#87958b]">Passengers</span><span className="text-sm font-semibold text-[#173f3b]">{search.passengers} {search.passengers === 1 ? 'person' : 'people'}</span></div>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Remove one passenger" disabled={search.passengers <= 1} onClick={() => setSearch({ ...search, passengers: Math.max(1, search.passengers - 1) })} className="grid h-9 w-9 place-items-center rounded-full border border-[#d9ded5] bg-white text-lg text-[#34504b] transition hover:border-[#d18a50] disabled:opacity-40">−</button>
              <span className="w-4 text-center text-sm font-bold tabular-nums">{search.passengers}</span>
              <button type="button" aria-label="Add one passenger" disabled={search.passengers >= 14} onClick={() => setSearch({ ...search, passengers: Math.min(14, search.passengers + 1) })} className="grid h-9 w-9 place-items-center rounded-full border border-[#d9ded5] bg-white text-lg text-[#34504b] transition hover:border-[#d18a50] disabled:opacity-40">+</button>
            </div>
          </div>
          <datalist id="ride-cities">{[...new Set(rides.flatMap((ride) => [ride.from, ride.to]))].map((city) => <option key={city} value={city} />)}</datalist>
          <button type="submit" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#173f3b] px-6 text-sm font-bold text-white shadow-lg shadow-[#173f3b]/15 transition hover:-translate-y-0.5 hover:bg-[#24564e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d18a50] sm:col-span-2 lg:col-span-1">
            Find a ride <span aria-hidden="true">↗</span>
          </button>
        </form>

        {!submittedSearch && (
          <div className="mx-auto mt-5 flex max-w-6xl flex-col gap-2 sm:mt-6 sm:flex-row sm:items-center sm:gap-3">
            <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#8a9890]">Popular journeys</span>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              {popularRoutes.map(([from, to]) => (
                <button key={`${from}-${to}`} type="button" onClick={() => showSampleRoute(from, to)} className="min-h-10 shrink-0 rounded-full border border-[#e1e3da] bg-white/75 px-3.5 text-xs font-semibold text-[#50665d] transition hover:border-[#d18a50] hover:bg-white hover:text-[#173f3b]">
                  {from} <span className="px-1 text-[#d18a50]">→</span> {to}
                </button>
              ))}
            </div>
          </div>
        )}

        {submittedSearch && (
          <section aria-live="polite" className="mx-auto mt-10 max-w-6xl scroll-mt-5 sm:mt-14">
            <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#b77c48]">Routes for your trip</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#173f3b] sm:text-3xl">{submittedSearch.from.trim()} <span className="text-[#c9915d]">→</span> {submittedSearch.to.trim()}</h2>
              </div>
              <p className="text-sm font-medium text-[#73827a]">{formatDate(submittedSearch.date)} <span className="px-1 text-[#c9915d]">·</span> {submittedSearch.passengers} {submittedSearch.passengers === 1 ? 'passenger' : 'passengers'}</p>
            </div>

            {results.length > 0 ? (
              <div className="grid gap-3 sm:gap-4">
                {results.map((ride) => {
                  const availableSeatCount = ride.seats.filter((seat) => seat.available).length
                  const lowestFare = Math.min(...ride.seats.filter((seat) => seat.available).map((seat) => seat.price))
                  const isOpen = openRideId === ride.id
                  return (
                    <article key={ride.id} className="ride-card overflow-hidden rounded-[1.5rem] border border-[#e4e5dc] bg-white p-4 shadow-[0_12px_35px_-28px_rgba(23,63,59,0.38)] sm:rounded-[1.75rem] sm:p-6">
                      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 sm:gap-5">
                            <div className="min-w-[4.7rem]"><p className="text-lg font-extrabold tracking-tight text-[#173f3b] sm:text-xl">{ride.departure}</p><p className="mt-1 text-xs text-[#73827a]">{ride.from}</p></div>
                            <div className="min-w-8 flex-1 text-center sm:max-w-36"><p className="text-[10px] font-semibold text-[#8b9890]">{ride.duration}</p><div className="route-dash relative mt-2 h-px bg-[#dfe5dc]"><span className="absolute -right-0.5 -top-1 h-2 w-2 rounded-full bg-[#d18a50]" /></div></div>
                            <div className="min-w-[4.7rem] text-right sm:text-left"><p className="text-lg font-extrabold tracking-tight text-[#173f3b] sm:text-xl">{ride.arrival}</p><p className="mt-1 text-xs text-[#73827a]">{ride.to}</p></div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold text-[#60756a] sm:mt-5 sm:text-xs">
                            <span className="rounded-full bg-[#f2f5ef] px-3 py-1.5">{ride.vehicle}</span>
                            <span className="rounded-full bg-[#f2f5ef] px-3 py-1.5">{availableSeatCount} seats available</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 border-t border-[#edf0e9] pt-3 sm:min-w-40 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                          <div className="sm:text-right"><span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b9890]">From</span><span className="text-xl font-extrabold tracking-tight text-[#173f3b]">{formatPrice(lowestFare)}</span></div>
                          <button type="button" onClick={() => setOpenRideId(isOpen ? null : ride.id)} aria-expanded={isOpen} className="min-h-11 rounded-xl bg-[#173f3b] px-4 text-xs font-bold text-white transition hover:bg-[#24564e] sm:min-h-12 sm:px-5 sm:text-sm">{isOpen ? 'Close seats' : 'Choose seats'} <span aria-hidden="true">{isOpen ? '−' : '→'}</span></button>
                        </div>
                      </div>
                      {isOpen && <SeatPicker ride={ride} date={submittedSearch.date} passengerCount={submittedSearch.passengers} />}
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-[#d6ddd3] bg-white/80 px-5 py-10 text-center sm:px-8 sm:py-14">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f5ead8] text-xl text-[#bd7e44]" aria-hidden="true">⌕</span>
                <h3 className="mt-4 text-lg font-bold text-[#173f3b] sm:text-xl">No rides found for this search</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#738179]">Try another date, route, or passenger count. Available places are listed in the city suggestions.</p>
              </div>
            )}
          </section>
        )}

        {!submittedSearch && (
          <section className="mx-auto mt-10 grid max-w-6xl gap-3 border-t border-[#dfe4da] pt-6 sm:mt-14 sm:grid-cols-3 sm:gap-5 sm:pt-8">
            {[
              ['01', 'Pick your route', 'Choose a hill town, travel date and group size.'],
              ['02', 'Choose your seats', 'Compare rides and select seats together.'],
              ['03', 'Meet along the way', 'Pick convenient stops for your journey.'],
            ].map(([number, title, detail]) => (
              <div key={number} className="flex items-start gap-3 rounded-2xl bg-white/55 p-4 sm:bg-transparent sm:p-0">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e4e9dd] text-[10px] font-extrabold text-[#4e6e5e]">{number}</span>
                <div><h2 className="text-sm font-bold text-[#294740]">{title}</h2><p className="mt-1 text-xs leading-5 text-[#7b8981] sm:text-sm">{detail}</p></div>
              </div>
            ))}
          </section>
        )}
      </section>
      <footer className="border-t border-[#e5e4dc] px-4 py-5 text-center text-[10px] font-medium text-[#87928a] sm:px-8 sm:py-6 sm:text-xs">RideBook <span className="px-1 text-[#cf8b51]">·</span> Find your way to the hills</footer>
    </main>
  )
}
