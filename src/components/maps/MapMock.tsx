import { MapPin, Navigation, Locate } from 'lucide-react'

interface MapMockProps {
  markers?: { lat: number; lng: number; label: string; type?: 'donor' | 'receiver' | 'route' }[]
  showRoute?: boolean
  className?: string
  height?: string
}

export function MapMock({ markers = [], showRoute = false, className = '', height = 'h-80' }: MapMockProps) {
  return (
    <div className={`relative ${height} rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Google Maps style background */}
      <div className="absolute inset-0 bg-[#E8F0FE]">
        <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
          <rect fill="#E8F0FE" width="800" height="400" />
          {/* Roads */}
          <path d="M0 200 H800" stroke="#fff" strokeWidth="8" fill="none" />
          <path d="M400 0 V400" stroke="#fff" strokeWidth="6" fill="none" />
          <path d="M0 100 Q200 120 400 100 T800 100" stroke="#fff" strokeWidth="4" fill="none" />
          <path d="M0 300 Q200 280 400 300 T800 300" stroke="#fff" strokeWidth="4" fill="none" />
          <path d="M100 0 V400" stroke="#fff" strokeWidth="3" fill="none" />
          <path d="M600 0 V400" stroke="#fff" strokeWidth="3" fill="none" />
          {/* Parks */}
          <ellipse cx="150" cy="150" rx="60" ry="40" fill="#C8E6C9" opacity="0.7" />
          <ellipse cx="650" cy="280" rx="50" ry="35" fill="#C8E6C9" opacity="0.7" />
          {/* Water */}
          <ellipse cx="700" cy="80" rx="40" ry="30" fill="#BBDEFB" opacity="0.6" />
          {/* Route line */}
          {showRoute && (
            <path
              d="M200 180 Q350 150 500 220 T650 250"
              stroke="#4285F4"
              strokeWidth="4"
              fill="none"
              strokeDasharray="8 4"
              opacity="0.8"
            />
          )}
        </svg>
      </div>

      {/* Markers */}
      {markers.map((m, i) => (
        <div
          key={i}
          className="absolute transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${20 + (i * 15) % 60}%`,
            top: `${30 + (i * 12) % 40}%`,
          }}
        >
          <div className={`relative group cursor-pointer`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
              m.type === 'donor' ? 'bg-primary' : m.type === 'route' ? 'bg-blue-500' : 'bg-accent'
            }`}>
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white rounded-lg shadow-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {m.label}
            </div>
          </div>
        </div>
      ))}

      {/* Map controls */}
      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Navigation className="w-4 h-4 text-gray-600" />
        </button>
        <button className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Locate className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Google attribution mock */}
      <div className="absolute bottom-2 left-2 text-[10px] text-gray-500 bg-white/80 px-2 py-0.5 rounded">
        Google Maps
      </div>
    </div>
  )
}
