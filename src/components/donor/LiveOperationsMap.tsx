import { MapPin, Navigation, Clock, AlertTriangle } from 'lucide-react'
import { MapMock } from '../maps/MapMock'
const liveMapData = {
  restaurant: { id: 'r1', lat: 13.0827, lng: 80.2707, name: 'ITC Grand Chola' },
  pickup: { id: 'p1', lat: 13.0827, lng: 80.2707, status: 'assigned' },
  ngos: [
    { id: 'n1', lat: 13.0900, lng: 80.2800, name: 'Robin Hood Army' },
    { id: 'n2', lat: 13.0700, lng: 80.2600, name: 'Akshaya Patra Foundation' }
  ],
  eta: '14 mins',
  distance: '3.2 km',
  traffic: 'Light Traffic'
}

export function LiveOperationsMap() {
  const markers = [
    { ...liveMapData.restaurant, type: 'donor' as const, label: liveMapData.restaurant.name },
    ...liveMapData.ngos.map(ngo => ({ ...ngo, type: 'receiver' as const, label: ngo.name })),
    { ...liveMapData.pickup, lat: liveMapData.pickup.lat, lng: liveMapData.pickup.lng, label: 'Pickup Route' },
  ]

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-text dark:text-white">Live Operations Map</h3>
          <p className="text-sm text-text-secondary mt-1">
          Restaurant location, nearby NGOs, and real-time ETA.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
            <Clock className="w-3.5 h-3.5" /> ETA {liveMapData.eta}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> {liveMapData.traffic}
          </span>
        </div>
      </div>
      <MapMock height="h-72" showRoute markers={markers} />
      <div className="grid sm:grid-cols-3 gap-4 mt-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-text-secondary">Distance: <strong className="text-text dark:text-white">{liveMapData.distance}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Navigation className="w-4 h-4 text-blue-500" />
          <span className="text-text-secondary">NGO: <strong className="text-text dark:text-white">Robin Hood Army</strong></span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="text-text-secondary">NGO: <strong className="text-text dark:text-white">Akshaya Patra Foundation</strong></span>
        </div>
      </div>
    </div>
  )
}
