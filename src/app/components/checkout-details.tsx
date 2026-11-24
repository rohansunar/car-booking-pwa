'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import type rides from '@/src/data/rides.json'

type Ride = (typeof rides)[number]
type Seat = Ride['seats'][number]

type CheckoutDetailsProps = {
  ride: Ride
  seats: Seat[]
  date: string
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

export default function CheckoutDetails({ ride, seats, date }: CheckoutDetailsProps) {
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  const total = seats.reduce((sum, seat) => sum + seat.price, 0)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const reference = `RB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    const booking = {
      id: reference,
      reference,
      rideId: ride.id,
      vehicleLabel: ride.vehicle,
      customerName: String(formData.get('fullName') ?? ''),
      customerEmail: String(formData.get('email') ?? ''),
      customerPhone: String(formData.get('phone') ?? ''),
      from: ride.from,
      to: ride.to,
      date,
      departure: ride.departure,
      seats: seats.map((seat) => ({ seatId: seat.id, price: seat.price })),
      total,
      status: 'Demo confirmed',
    }

    try {
      const stored = JSON.parse(localStorage.getItem('ridebook.operator.bookings') ?? '[]')
      localStorage.setItem('ridebook.operator.bookings', JSON.stringify([booking, ...(Array.isArray(stored) ? stored : [])]))
      window.dispatchEvent(new Event('ridebook:local-storage-change'))
    } catch {
      localStorage.setItem('ridebook.operator.bookings', JSON.stringify([booking]))
      window.dispatchEvent(new Event('ridebook:local-storage-change'))
    }
    setBookingReference(reference)
  }

  return (
    <main className="min-h-screen bg-[#f5f7f4] px-5 py-8 text-[#18332c] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4c6d5c] hover:text-[#1d493d]">
          <span aria-hidden="true">←</span> Back to rides
        </Link>

        <div className="mt-7 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#71917f]">Almost there</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Review your booking</h1>
          <p className="mt-2 text-[#718078]">Check your trip and seat details before confirming.</p>
        </div>

        {bookingReference ? (
          <section className="mt-8 rounded-3xl border border-[#cfe0d2] bg-white p-7 shadow-sm sm:p-10" aria-live="polite">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f2e8] text-2xl text-[#317248]" aria-hidden="true">✓</span>
            <h2 className="mt-5 text-2xl font-semibold">Demo booking confirmed</h2>
            <p className="mt-2 text-[#718078]">Your selected seats are ready. This demo confirmation is saved only in this browser, not to a live booking service.</p>
            <p className="mt-5 text-sm text-[#718078]">Reference</p>
            <p className="font-bold tracking-wide">{bookingReference}</p>
            <Link href="/" className="mt-7 inline-flex rounded-xl bg-[#1d493d] px-5 py-3 font-semibold text-white hover:bg-[#28604f]">Return to rides</Link>
          </section>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-3xl border border-[#e2e9e3] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#edf0ed] pb-5">
                <div>
                  <p className="text-sm font-medium text-[#718078]">{formatDate(date)}</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    {ride.from} <span className="text-[#8b9b92]">→</span> {ride.to}
                  </h2>
                </div>
                <span className="rounded-full bg-[#eff5f0] px-3 py-1.5 text-xs font-semibold text-[#4d705a]">
                  {ride.capacityIncludesDriver
                    ? `${ride.capacity}-seater`
                    : `${ride.capacity} passenger seats + driver`}{' '}
                  · {ride.vehicle}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-[#edf0ed] py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#91a097]">Departure</p>
                  <p className="mt-1 font-semibold">{ride.departure}</p>
                  <p className="text-sm text-[#718078]">{ride.from}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#91a097]">Arrival</p>
                  <p className="mt-1 font-semibold">{ride.arrival}</p>
                  <p className="text-sm text-[#718078]">{ride.to}</p>
                </div>
              </div>

              <div className="pt-5">
                <h3 className="font-semibold">Your seats</h3>
                <ul className="mt-3 divide-y divide-[#edf0ed]">
                  {seats.map((seat) => (
                    <li key={seat.id} className="flex items-center justify-between py-3 text-sm">
                      <span><span className="font-semibold">Seat {seat.id}</span><span className="ml-2 text-[#718078]">{seat.type}</span></span>
                      <span className="font-semibold">{formatPrice(seat.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#dfe7e0] pt-4">
                <span className="font-semibold">Total for {seats.length} {seats.length === 1 ? 'seat' : 'seats'}</span>
                <span className="text-xl font-bold text-[#1d493d]">{formatPrice(total)}</span>
              </div>
            </section>

            <form onSubmit={handleSubmit} className="h-fit rounded-3xl border border-[#e2e9e3] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold">Passenger details</h2>
              <p className="mt-1 text-sm text-[#718078]">Who should this demo booking be for?</p>

              <label className="mt-6 block text-sm font-semibold">
                Full name
                <input required name="fullName" autoComplete="name" className="mt-2 min-h-12 w-full rounded-xl border border-[#dce5de] px-3 font-normal outline-none focus:border-[#6e9e7e] focus:ring-2 focus:ring-[#dbeadf]" placeholder="Your name" />
              </label>
              <label className="mt-4 block text-sm font-semibold">
                Email address
                <input required type="email" name="email" autoComplete="email" className="mt-2 min-h-12 w-full rounded-xl border border-[#dce5de] px-3 font-normal outline-none focus:border-[#6e9e7e] focus:ring-2 focus:ring-[#dbeadf]" placeholder="you@example.com" />
              </label>
              <label className="mt-4 block text-sm font-semibold">
                Mobile number
                <input required type="tel" name="phone" inputMode="tel" autoComplete="tel" pattern="[+]?[0-9 -]{8,16}" title="Enter a valid phone number" className="mt-2 min-h-12 w-full rounded-xl border border-[#dce5de] px-3 font-normal outline-none focus:border-[#6e9e7e] focus:ring-2 focus:ring-[#dbeadf]" placeholder="+91 98765 43210" />
              </label>

              <button type="submit" className="mt-6 min-h-12 w-full rounded-xl bg-[#1d493d] px-5 font-semibold text-white transition hover:bg-[#28604f]">
                Confirm demo booking · {formatPrice(total)}
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-[#8a978f]">Demo only. Saved in this browser; no payment is taken.</p>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
