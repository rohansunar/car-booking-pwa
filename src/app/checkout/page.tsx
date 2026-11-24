import Link from 'next/link'
import CheckoutDetails from '@/src/app/components/checkout-details'
import rides from '@/src/data/rides.json'
import { getRidePoints } from '@/src/lib/ride-points'

export const instant = false

type CheckoutPageProps = {
  searchParams: Promise<{
    ride?: string | string[]
    seats?: string | string[]
    date?: string | string[]
    passengers?: string | string[]
    pickup?: string | string[]
    drop?: string | string[]
  }>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams
  const rideId = typeof params.ride === 'string' ? params.ride : ''
  const seatIds = typeof params.seats === 'string'
    ? [...new Set(params.seats.split(',').filter(Boolean))]
    : []
  const date = typeof params.date === 'string' ? params.date : ''
  const passengerCount = typeof params.passengers === 'string' ? Number(params.passengers) : 0
  const pickupPoint = typeof params.pickup === 'string' ? params.pickup : ''
  const dropPoint = typeof params.drop === 'string' ? params.drop : ''
  const ride = rides.find((candidate) => candidate.id === rideId)
  const seats = ride?.seats.filter((seat) => seat.available && seatIds.includes(seat.id)) ?? []
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
  const validSelection = ride && passengerCount > 0 && seatIds.length === passengerCount && seats.length === seatIds.length && validDate && getRidePoints(ride.from).includes(pickupPoint) && getRidePoints(ride.to).includes(dropPoint)

  if (!validSelection || !ride) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4] px-5 text-center text-[#18332c]">
        <section className="max-w-md rounded-3xl border border-[#e2e9e3] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold">That seat selection is no longer available</h1>
          <p className="mt-3 text-sm leading-6 text-[#718078]">Go back to the rides list and choose available seats to continue.</p>
          <Link href="/" className="mt-6 inline-flex rounded-xl bg-[#1d493d] px-5 py-3 font-semibold text-white hover:bg-[#28604f]">Find another ride</Link>
        </section>
      </main>
    )
  }

  return <CheckoutDetails ride={ride} seats={seats} date={date} pickupPoint={pickupPoint} dropPoint={dropPoint} />
}
