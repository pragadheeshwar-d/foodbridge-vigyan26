import { motion } from 'framer-motion'
import { MapPin, Clock, Users, ArrowRight } from 'lucide-react'
import { Badge, StatusBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
export interface DonationItem {
  id: string
  food: string
  restaurant: string
  image: string
  type: 'veg' | 'nonveg'
  meals: number
  pickupTime: string
  distance: string
  status: 'available' | 'pending' | 'claimed'
}

interface DonationCardProps {
  donation: DonationItem
  onRequest?: () => void
  compact?: boolean
}

export function DonationCard({ donation, onRequest, compact = false }: DonationCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card overflow-hidden group"
    >
      <div className={`relative ${compact ? 'h-40' : 'h-48'} overflow-hidden`}>
        <img
          src={donation.image}
          alt={donation.food}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={donation.type === 'veg' ? 'veg' : 'nonveg'}>
            {donation.type === 'veg' ? ' Veg' : ' Non-Veg'}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={donation.status} />
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg">{donation.food}</h3>
          <p className="text-white/80 text-sm">{donation.restaurant}</p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <Users className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-xs text-text-secondary">Meals</p>
            <p className="text-sm font-bold">{donation.meals}</p>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <Clock className="w-4 h-4 mx-auto text-accent mb-1" />
            <p className="text-xs text-text-secondary">Pickup</p>
            <p className="text-sm font-bold">{donation.pickupTime}</p>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <MapPin className="w-4 h-4 mx-auto text-primary-light mb-1" />
            <p className="text-xs text-text-secondary">Distance</p>
            <p className="text-sm font-bold">{donation.distance}</p>
          </div>
        </div>
        {onRequest && (
          <Button
            variant="primary"
            className="w-full"
            onClick={onRequest}
            disabled={donation.status !== 'available'}
          >
            Request Pickup <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}
