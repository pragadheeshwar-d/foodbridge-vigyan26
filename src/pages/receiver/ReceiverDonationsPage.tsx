import { useMemo, useState } from 'react'
import { Filter, Search, ShieldCheck, Loader2 } from 'lucide-react'
import { ReceiverShell } from '../../components/receiver/ReceiverShell'
import { Input, Select } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { DonationCard } from '../../components/cards/DonationCard'
import { useToast } from '../../context/ToastContext'
import { useAvailableDonations, type AvailableDonation } from '../../hooks/useReceiverStats'
import { useAuth } from '../../context/AuthContext'
import { createPickupRequest } from '../../services/pickupRequestService'

type FoodFilter = 'all' | 'veg' | 'nonveg'
type DistanceFilter = 'all' | '1' | '3' | '5'
type QuantityFilter = 'all' | 'small' | 'medium' | 'large'
type ExpiryFilter = 'all' | 'urgent' | 'safe'

export default function ReceiverDonationsPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(true)
  const [foodType, setFoodType] = useState<FoodFilter>('all')
  const [distance, setDistance] = useState<DistanceFilter>('all')
  const [quantity, setQuantity] = useState<QuantityFilter>('all')
  const [expiry, setExpiry] = useState<ExpiryFilter>('all')
  const [requestingId, setRequestingId] = useState<string | null>(null)
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set())

  const { donations, loading } = useAvailableDonations()

  const filteredFood = useMemo(() => {
    return donations.filter((f) => {
      if (requestedIds.has(f.id)) return false
      if (foodType !== 'all' && f.type !== foodType) return false
      if (
        search &&
        !f.food.toLowerCase().includes(search.toLowerCase()) &&
        !f.restaurant.toLowerCase().includes(search.toLowerCase())
      ) return false
      if (quantity !== 'all') {
        if (quantity === 'small' && f.meals >= 20) return false
        if (quantity === 'medium' && (f.meals < 20 || f.meals > 50)) return false
        if (quantity === 'large' && f.meals <= 50) return false
      }
      if (expiry !== 'all') {
        const minutes = parseInt((f.timeLeft || '').replace(/[^0-9]/g, '') || '0', 10)
        if (expiry === 'urgent' && minutes > 120) return false
        if (expiry === 'safe' && minutes <= 120) return false
      }
      void distance
      return true
    })
  }, [donations, requestedIds, search, foodType, distance, quantity, expiry])

  const handleRequest = async (donation: AvailableDonation) => {
    if (!user) {
      toast('Please sign in to request a pickup.', 'warning')
      return
    }
    if (user.status !== 'approved') {
      toast('Your account is pending admin verification.', 'warning')
      return
    }
    setRequestingId(donation.id)
    try {
      await createPickupRequest({
        donationId: donation.id,
        donorId: donation.donorId,
        donorName: donation.donorName || donation.restaurant,
        donorOrganization: donation.donorOrganization || donation.restaurant,
        receiverId: user.id,
        receiverName: user.name,
        receiverOrganization: user.organization,
        foodType: donation.food,
        quantity: donation.meals,
        unit: 'meals',
        pickupAddress: donation.pickupTime,
        pickupTime: null,
      })
      setRequestedIds((prev) => {
        const next = new Set(prev)
        next.add(donation.id)
        return next
      })
      toast(`Pickup request sent for ${donation.food}.`, 'success')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to send pickup request'
      toast(msg, 'error')
    } finally {
      setRequestingId(null)
    }
  }

  return (
    <ReceiverShell>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Available Donations</h1>
          <p className="text-text-secondary">Find and request fresh food donations nearby.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              icon
              placeholder="Search by restaurant or food name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-slide-down pt-2 border-t border-gray-100 dark:border-gray-800">
            <Select
              label="Food Type"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value as FoodFilter)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'veg', label: 'Vegetarian' },
                { value: 'nonveg', label: 'Non-Veg' },
              ]}
            />
            <Select
              label="Distance"
              value={distance}
              onChange={(e) => setDistance(e.target.value as DistanceFilter)}
              options={[
                { value: 'all', label: 'Any Distance' },
                { value: '1', label: 'Within 1 km' },
                { value: '3', label: 'Within 3 km' },
                { value: '5', label: 'Within 5 km' },
              ]}
            />
            <Select
              label="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value as QuantityFilter)}
              options={[
                { value: 'all', label: 'Any Quantity' },
                { value: 'small', label: 'Small (< 20)' },
                { value: 'medium', label: 'Medium (20-50)' },
                { value: 'large', label: 'Large (50+)' },
              ]}
            />
            <Select
              label="Expiry Time"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value as ExpiryFilter)}
              options={[
                { value: 'all', label: 'Any Expiry' },
                { value: 'urgent', label: 'Expires < 2hrs' },
                { value: 'safe', label: 'Expires > 2hrs' },
              ]}
            />
            <Select
              label="Pickup Time"
              options={[
                { value: 'all', label: 'Any Time' },
                { value: 'now', label: 'Available Now' },
              ]}
            />
          </div>
        )}
      </div>

      {/* Donations Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-text-secondary">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p>Scanning for nearby donations...</p>
          </div>
        ) : filteredFood.length > 0 ? (
          filteredFood.map((donation) => (
            <div key={donation.id} className="relative">
              <DonationCard
                donation={donation}
                onRequest={() => handleRequest(donation)}
              />
              <div className="bg-gray-50 dark:bg-gray-800/80 rounded-b-2xl p-3 -mt-4 pt-6 flex justify-between items-center text-xs border border-t-0 border-gray-100 dark:border-gray-700/50">
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {donation.timeLeft}
                </span>
                <span className="text-primary font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> {donation.hygieneStatus}
                </span>
              </div>
              {requestingId === donation.id && (
                <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-text-secondary">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg">No available donations found matching your criteria.</p>
          </div>
        )}
      </div>
    </ReceiverShell>
  )
}
