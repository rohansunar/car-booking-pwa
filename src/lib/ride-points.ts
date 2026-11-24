const ridePoints: Record<string, string[]> = {
  Siliguri: ['Tenzing Norgay Bus Terminus', 'NJP Railway Station', 'Bagdogra Airport'],
  Darjeeling: ['Chowk Bazaar', 'Darjeeling Mall', 'Darjeeling Railway Station'],
  Gangtok: ['Deorali Taxi Stand', 'MG Marg', 'Vajra Taxi Stand'],
  Kalimpong: ['Kalimpong Bus Stand', 'Damber Chowk', '10th Mile'],
  Kurseong: ['Kurseong Motor Stand', 'Kurseong Railway Station', "Eagle's Crag"],
  Sonada: ['Sonada Bazaar', 'Sonada Railway Station', 'Sonada Taxi Stand'],
}

export function getRidePoints(city: string) {
  return ridePoints[city] ?? [`${city} Bus Stand`, `${city} Main Market`]
}
