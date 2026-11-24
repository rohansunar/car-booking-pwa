'use client'

import { Fragment, useState } from 'react'
import Link from 'next/link'
import rides from '@/src/data/rides.json'
import vehicleLayouts from '@/src/data/vehicle-layouts.json'

type Ride = (typeof rides)[number]

type SeatPickerProps = {
  ride: Ride
  date: string
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

export default function SeatPicker({ ride, date }: SeatPickerProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const layout = vehicleLayouts[String(ride.capacity) as keyof typeof vehicleLayouts]
  const seatsById = new Map(ride.seats.map((seat) => [seat.id, seat]))

  function toggleSeat(seatId: string) {
    setSelectedSeats((current) =>
      current.includes(seatId)
        ? current.filter((id) => id !== seatId)
        : [...current, seatId]
    )
  }

  const total = ride.seats
    .filter((seat) => selectedSeats.includes(seat.id))
    .reduce((sum, seat) => sum + seat.price, 0)
  const checkoutQuery = new URLSearchParams({
    ride: ride.id,
    seats: selectedSeats.join(','),
    date,
  }).toString()

  function renderSeat(seatId: string) {
    if (seatId === 'D') {
      return (
        <div
          key="driver"
          role="img"
          aria-label="Driver seat, not bookable"
          className="flex h-[6.25rem] w-[4.1rem] shrink-0 flex-col items-center justify-center rounded-[1.1rem] border border-[#cbd5ce] bg-[#e5ebe6] px-1 text-center text-[#66756c] shadow-[inset_0_2px_3px_rgba(47,70,56,0.08)]"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="mb-1 h-6 w-6" stroke="currentColor" strokeWidth="1.7">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="2" />
            <path d="M5.6 5.6 10.5 10.5M18.4 5.6l-4.9 4.9M12 14v7" />
          </svg>
          <span className="text-[11px] font-bold">Driver</span>
          <span className="text-[9px] leading-3">Not bookable</span>
        </div>
      )
    }

    const seat = seatsById.get(seatId)
    if (!seat) return <span key={seatId} aria-hidden="true" />

    const selected = selectedSeats.includes(seat.id)
    const seatColor = !seat.available
      ? 'border-[#d9dfdb] bg-[#e8ece9] text-[#9ba69f]'
      : selected
        ? 'border-[#1d493d] bg-[#1d493d] text-white'
        : 'border-[#c8d8cd] bg-white text-[#29493d] hover:border-[#6e9e7e] hover:shadow-md'
    const detailColor = selected
      ? 'border-white/30 bg-white/15'
      : seat.available
        ? 'border-[#e0e9e2] bg-[#edf3ee]'
        : 'border-[#d7ddda] bg-[#dfe5e1]'

    return (
      <button
        key={seat.id}
        type="button"
        disabled={!seat.available}
        aria-pressed={selected}
        aria-label={`${seat.id}, ${seat.type}, ${formatPrice(seat.price)}${seat.available ? '' : ', taken'}`}
        onClick={() => toggleSeat(seat.id)}
        className={`flex h-[6.25rem] w-[4.1rem] shrink-0 flex-col items-center justify-between rounded-[1.1rem] border-2 px-1 pb-1.5 pt-1.5 text-center transition disabled:cursor-not-allowed ${seatColor}`}
      >
        <span className={`flex h-7 w-8 flex-col items-center justify-center gap-0.5 rounded-lg border ${detailColor}`}>
          <span className={`h-1.5 w-3 rounded-full ${selected ? 'bg-white/70' : 'bg-current opacity-50'}`} />
          <span className={`h-2.5 w-5 rounded-md ${selected ? 'bg-white/70' : 'bg-current opacity-30'}`} />
        </span>
        <span className="w-full">
          <span className="block text-[11px] font-extrabold leading-4">{seat.id}</span>
          <span className="block truncate text-[8px] leading-3">{seat.available ? seat.type : 'Taken'}</span>
          <span className="block text-[10px] font-bold leading-4">{formatPrice(seat.price)}</span>
        </span>
      </button>
    )
  }

  return (
    <div className="mt-6 border-t border-[#edf0ed] pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">Choose your seats</h3>
          <p className="mt-1 text-sm text-[#78877f]">Seat prices vary by position.</p>
        </div>
        <div className="flex gap-3 text-xs text-[#718078]">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-[#c8d8cd] bg-white" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#1d493d]" /> Selected</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#e8ece9]" /> Taken</span>
        </div>
      </div>

      <div className="mt-4 rounded-[2rem] border border-[#e5ebe6] bg-[#f7f9f7] p-4 sm:p-6">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.16em] text-[#95a199]">
          {ride.capacityIncludesDriver
            ? `${ride.capacity}-seater layout`
            : `${ride.capacity} passenger seats + driver`}
        </p>

        <div className="relative mx-auto mt-4 max-w-[26rem] rounded-[3.5rem] border-[6px] border-[#d5e0d8] bg-[#eaf1ec] px-3 pb-5 pt-4 shadow-[inset_0_2px_8px_rgba(48,78,59,0.08)] sm:px-5">
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-16 left-1.5 w-1 rounded-full bg-white/80" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-16 right-1.5 w-1 rounded-full bg-white/80" />

          <div className="relative mx-auto flex h-9 max-w-[18rem] items-center justify-center rounded-t-[1.8rem] rounded-b-lg border border-[#c6d7cb] bg-gradient-to-b from-[#d6e6db] to-[#edf4ef]">
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#799181]">Windscreen · front</span>
          </div>

          <div className="relative mt-4 space-y-4">
            {layout.map((row, rowIndex) => {
              const rowName = rowIndex === 0
                ? 'Front row'
                : rowIndex === layout.length - 1
                  ? 'Rear row'
                  : layout.length === 3
                    ? 'Middle row'
                    : `Row ${rowIndex + 1}`

              return (
                <div key={`row-${rowIndex}`}>
                  <p className="mb-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.15em] text-[#9aaa9f]">{rowName}</p>
                  <div className="flex min-h-[6.25rem] items-center justify-center gap-1.5">
                    {row.map((seatId, seatIndex) => (
                      <Fragment key={seatId}>
                        {row.length === 4 && seatIndex === 2 && (
                          <span aria-hidden="true" className="w-2 shrink-0 border-l border-dashed border-[#ccd9cf] self-stretch" />
                        )}
                        {renderSeat(seatId)}
                      </Fragment>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div aria-hidden="true" className="relative mx-auto mt-4 h-3 max-w-[15rem] rounded-b-xl border-x border-b border-[#c8d8cd] bg-[#dce9df]" />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#66786e]">
          {selectedSeats.length > 0
            ? `${selectedSeats.length} ${selectedSeats.length === 1 ? 'seat' : 'seats'} selected · ${formatPrice(total)}`
            : 'Select one or more available seats'}
        </p>
        {selectedSeats.length > 0 ? (
          <Link
            href={`/checkout?${checkoutQuery}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1d493d] px-5 font-semibold text-white transition hover:bg-[#28604f]"
          >
            Continue to checkout <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="min-h-12 cursor-not-allowed rounded-xl bg-[#e6ece8] px-5 font-semibold text-[#94a39a]"
          >
            Continue to checkout
          </button>
        )}
      </div>
    </div>
  )
}
