'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import SeatPicker from '@/src/app/components/seat-picker'
import rides from '@/src/data/rides.json'

type Search = {
  from: string
  to: string
  date: string
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

export default function HomePage() {
  const [search, setSearch] = useState<Search>({ from: '', to: '', date: '' })
  const [submittedSearch, setSubmittedSearch] = useState<Search | null>(null)
  const [openRideId, setOpenRideId] = useState<string | null>(null)

  const results = submittedSearch
    ? rides.filter(
        (ride) =>
          ride.from.toLowerCase() === submittedSearch.from.trim().toLowerCase() &&
          ride.to.toLowerCase() === submittedSearch.to.trim().toLowerCase() &&
          getLocalDateAfter(ride.daysFromToday) === submittedSearch.date
      )
    : []

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittedSearch(search)
  }

  function showSampleRoute(from: string, to: string) {
    const sampleRide = rides.find((ride) => ride.from === from && ride.to === to)
    if (!sampleRide) return

    const sampleSearch = {
      from,
      to,
      date: getLocalDateAfter(sampleRide.daysFromToday),
    }
    setSearch(sampleSearch)
    setSubmittedSearch(sampleSearch)
  }

  return (
    <main className="min-h-screen bg-[#f5f7f4] text-[#18332c]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="RideBook home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d493d] text-lg font-bold text-white">
            R
          </span>
          <span className="text-xl font-bold tracking-tight">RideBook</span>
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-[#d9e1dc] px-4 py-2 text-sm font-semibold transition hover:border-[#1d493d] hover:bg-white"
        >
          Operator login
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e6eee9] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#356b59]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4d9b70]" />
            Shared rides, made simple
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-[-0.04em] text-[#18332c] sm:text-6xl">
            Your next ride is <span className="text-[#4b8c6b]">closer.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#64766f] sm:text-lg">
            Find a seat, share the journey, and get where you’re going for less.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-10 grid max-w-5xl gap-3 rounded-3xl border border-[#e5ebe6] bg-white p-4 shadow-[0_18px_60px_-35px_rgba(24,51,44,0.32)] sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end sm:gap-2 sm:p-5"
        >
          <label className="block rounded-2xl bg-[#f7f9f7] px-4 py-3 transition focus-within:ring-2 focus-within:ring-[#74a88a]">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#788981]">From</span>
            <input
              required
              list="ride-cities"
              value={search.from}
              onChange={(event) => setSearch({ ...search, from: event.target.value })}
              placeholder="Leaving from"
              className="w-full bg-transparent text-base font-semibold text-[#18332c] outline-none placeholder:font-normal placeholder:text-[#a3aea8]"
            />
          </label>
          <label className="block rounded-2xl bg-[#f7f9f7] px-4 py-3 transition focus-within:ring-2 focus-within:ring-[#74a88a]">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#788981]">To</span>
            <input
              required
              list="ride-cities"
              value={search.to}
              onChange={(event) => setSearch({ ...search, to: event.target.value })}
              placeholder="Going to"
              className="w-full bg-transparent text-base font-semibold text-[#18332c] outline-none placeholder:font-normal placeholder:text-[#a3aea8]"
            />
          </label>
          <label className="block rounded-2xl bg-[#f7f9f7] px-4 py-3 transition focus-within:ring-2 focus-within:ring-[#74a88a]">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#788981]">Travel date</span>
            <input
              required
              type="date"
              value={search.date}
              onChange={(event) => setSearch({ ...search, date: event.target.value })}
              className="w-full bg-transparent text-base font-semibold text-[#18332c] outline-none"
            />
          </label>
          <datalist id="ride-cities">
            {[...new Set(rides.flatMap((ride) => [ride.from, ride.to]))].map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
          <button
            type="submit"
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#1d493d] px-6 font-semibold text-white transition hover:bg-[#28604f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d493d]"
          >
            Search rides
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <div className="mx-auto mt-5 flex max-w-5xl flex-wrap items-center justify-center gap-2 text-sm sm:justify-start">
          <span className="font-semibold text-[#60736a]">Popular routes</span>
          {[
            ['Delhi', 'Jaipur'],
            ['Jaipur', 'Delhi'],
            ['Mumbai', 'Pune'],
            ['Bengaluru', 'Mysuru'],
            ['Chandigarh', 'Shimla'],
          ].map(([from, to]) => (
            <button
              key={`${from}-${to}`}
              type="button"
              onClick={() => showSampleRoute(from, to)}
              className="rounded-full px-3 py-1.5 text-[#718078] transition hover:bg-white hover:text-[#1d493d]"
            >
              {from} → {to}
            </button>
          ))}
        </div>

        {submittedSearch && (
          <section aria-live="polite" className="mx-auto mt-12 max-w-5xl">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#71917f]">Available shared rides</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  {submittedSearch.from.trim()} <span className="text-[#8b9b92]">→</span>{' '}
                  {submittedSearch.to.trim()}
                </h2>
              </div>
              <p className="text-sm text-[#718078]">{formatDate(submittedSearch.date)}</p>
            </div>

            {results.length > 0 ? (
              <div className="grid gap-4">
                {results.map((ride) => (
                  <article
                    key={ride.id}
                    className="rounded-3xl border border-[#e2e9e3] bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                          <div>
                            <p className="text-xl font-bold tracking-tight">{ride.departure}</p>
                            <p className="mt-1 text-sm text-[#728078]">{ride.from}</p>
                          </div>
                          <div className="min-w-20 flex-1 text-center sm:max-w-40">
                            <p className="text-xs text-[#87958e]">{ride.duration}</p>
                            <div className="relative mt-2 h-px bg-[#dce5de]">
                              <span className="absolute -top-1 right-0 h-2 w-2 rounded-full bg-[#69a17e]" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xl font-bold tracking-tight">{ride.arrival}</p>
                            <p className="mt-1 text-sm text-[#728078]">{ride.to}</p>
                          </div>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-[#60756a]">
                          <span className="rounded-full bg-[#f0f5f1] px-3 py-1.5">
                            {ride.capacityIncludesDriver
                              ? `${ride.capacity}-seater`
                              : `${ride.capacity} passenger seats + driver`}{' '}
                            · {ride.vehicle}
                          </span>
                          <span className="rounded-full bg-[#f0f5f1] px-3 py-1.5">
                            {ride.seats.filter((seat) => seat.available).length} seats left
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-[#edf0ed] pt-4 sm:min-w-40 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                        <div className="sm:text-right">
                          <span className="block text-sm text-[#78877f]">Seats from</span>
                          <span className="text-2xl font-bold tracking-tight text-[#1d493d]">
                            {new Intl.NumberFormat('en-IN', {
                              style: 'currency',
                              currency: 'INR',
                              maximumFractionDigits: 0,
                            }).format(Math.min(...ride.seats.filter((seat) => seat.available).map((seat) => seat.price)))}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOpenRideId(openRideId === ride.id ? null : ride.id)}
                          aria-expanded={openRideId === ride.id}
                          className="rounded-xl border border-[#cbd9cf] px-4 py-2.5 text-sm font-semibold text-[#1d493d] transition hover:bg-[#f0f5f1]"
                        >
                          {openRideId === ride.id ? 'Hide seats' : 'Select seats'}
                        </button>
                      </div>
                    </div>
                    {openRideId === ride.id && submittedSearch && (
                      <SeatPicker ride={ride} date={submittedSearch.date} />
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#cbd8ce] bg-white px-6 py-12 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3ee] text-xl text-[#47745d]" aria-hidden="true">
                  ↗
                </span>
                <h3 className="mt-4 text-xl font-semibold">No rides found for this search</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#738179]">
                  Try another date or check the city names. New shared rides are added regularly.
                </p>
              </div>
            )}
          </section>
        )}

        {!submittedSearch && (
          <section className="mx-auto mt-16 grid max-w-5xl gap-4 border-t border-[#dfe7e0] pt-8 sm:grid-cols-3">
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e5eee7] text-[#356b59]">01</span>
              <div><h2 className="font-semibold">Search your route</h2><p className="mt-1 text-sm text-[#78877f]">Choose where and when you want to go.</p></div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e5eee7] text-[#356b59]">02</span>
              <div><h2 className="font-semibold">Compare rides</h2><p className="mt-1 text-sm text-[#78877f]">See departure times, seats and fares.</p></div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e5eee7] text-[#356b59]">03</span>
              <div><h2 className="font-semibold">Travel together</h2><p className="mt-1 text-sm text-[#78877f]">Share the road and split the ride.</p></div>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}
