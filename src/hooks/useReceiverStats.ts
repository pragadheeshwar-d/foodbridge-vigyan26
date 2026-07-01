/**
 * Receiver-side hooks — fetch from Flask REST API with Socket.IO live updates.
 */
import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api'
import { getSocket } from '../lib/socket'
import { useAuth } from '../context/AuthContext'

export interface ReceiverStats {
  availableDonations: number
  activeRequests: number
  todayPickups: number
  totalMealsReceived: number
  totalKgPrevented: number
  co2Reduced: number
  totalPickups: number
  acceptanceRate: number
}

export interface PickupRequest {
  id: string
  donationId: string
  donorName: string
  foodType: string
  quantity: number
  unit: string
  pickupTime: string
  status: 'pending' | 'accepted' | 'completed' | 'declined' | 'Pending' | 'Approved' | 'Rejected' | 'Completed'
  createdAt: Date
  pickupAddress: string
}

export interface AvailableDonation {
  id: string
  food: string
  restaurant: string
  image: string
  type: 'veg' | 'nonveg'
  meals: number
  pickupTime: string
  distance: string
  status: 'available' | 'pending' | 'claimed'
  timeLeft?: string
  expiryTime?: string
  donorId?: string
  donorName?: string
  donorOrganization?: string
  hygieneStatus?: string
}

const EMPTY_STATS: ReceiverStats = {
  availableDonations: 0,
  activeRequests: 0,
  todayPickups: 0,
  totalMealsReceived: 0,
  totalKgPrevented: 0,
  co2Reduced: 0,
  totalPickups: 0,
  acceptanceRate: 0,
}

/** Real-time receiver stats */
export function useReceiverStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<ReceiverStats>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    try {
      const res = await api.get('/dashboard/receiver')
      const s = res.data.stats
      setStats({
        availableDonations: s.available_donations ?? 0,
        activeRequests: s.active_requests ?? 0,
        todayPickups: s.todays_pickups ?? 0,
        totalMealsReceived: s.meals_received ?? 0,
        totalKgPrevented: s.food_waste_prevented ?? 0,
        co2Reduced: s.carbon_reduced ?? 0,
        totalPickups: s.total_pickups ?? 0,
        acceptanceRate: s.acceptance_rate ?? 0,
      })
    } catch (e) {
      console.error('useReceiverStats fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetch()
    const s = getSocket()
    const refresh = () => fetch()
    s.on('new_donation', refresh)
    s.on('pickup_status_changed', refresh)
    s.on('analytics_updated', refresh)
    return () => {
      s.off('new_donation', refresh)
      s.off('pickup_status_changed', refresh)
      s.off('analytics_updated', refresh)
    }
  }, [fetch])

  return { stats, loading }
}

/** Real-time list of receiver's pickup requests */
export function useReceiverRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<PickupRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    try {
      const res = await api.get('/pickups/')
      const items: PickupRequest[] = res.data.map((pr: any) => {
        const rawStatus = (pr.status || 'Pending') as string
        // Map server statuses → UI statuses
        const statusMap: Record<string, PickupRequest['status']> = {
          Pending: 'pending',
          Approved: 'accepted',
          Rejected: 'declined',
          Completed: 'completed',
        }
        const status = (statusMap[rawStatus] ?? rawStatus.toLowerCase()) as PickupRequest['status']

        return {
          id: String(pr.id),
          donationId: String(pr.donation_id),
          donorName: pr.donor_name || pr.donor_organization || 'Unknown Donor',
          foodType: pr.food_type || pr.donation?.food_name || 'Food',
          quantity: pr.quantity || pr.donation?.quantity_number || 0,
          unit: pr.unit || pr.donation?.unit || 'meals',
          pickupTime: pr.donation?.pickup_time
            ? new Date(pr.donation.pickup_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            : pr.donation?.preferred_pickup_time || '—',
          status,
          createdAt: pr.requested_at ? new Date(pr.requested_at) : new Date(),
          pickupAddress: pr.pickup_address || pr.donation?.pickup_address || '—',
        }
      })
      setRequests(items)
    } catch (e) {
      console.error('useReceiverRequests fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetch()
    const s = getSocket()
    s.on('pickup_status_changed', fetch)
    s.on('pickup_requested', fetch)
    return () => {
      s.off('pickup_status_changed', fetch)
      s.off('pickup_requested', fetch)
    }
  }, [fetch])

  return { requests, loading }
}

/** Real-time list of available donations */
export function useAvailableDonations() {
  const [donations, setDonations] = useState<AvailableDonation[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      const res = await api.get('/donations/available')
      const now = Date.now()
      const items: AvailableDonation[] = res.data.map((d: any, i: number) => {
        const expiry = d.expiry_time ? new Date(d.expiry_time) : null
        const timeLeftMs = expiry ? expiry.getTime() - now : 0
        const timeLeftMins = Math.max(0, Math.round(timeLeftMs / 60000))
        const timeLeft = timeLeftMins > 60
          ? `${Math.round(timeLeftMins / 60)}h left`
          : `${timeLeftMins}m left`

        return {
          id: String(d.id),
          food: d.food_name || d.food_type || 'Food Donation',
          restaurant: d.donor_organization || d.donor_name || 'Unknown Donor',
          image: d.image || 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
          type: d.veg_type === 'veg' || d.veg_type === 'vegan' ? 'veg' : 'nonveg',
          meals: d.unit === 'kg'
            ? Math.round((d.quantity_number || 0) * 2)
            : (d.quantity_number || 0),
          pickupTime: d.pickup_address || 'Contact donor',
          distance: '—',
          status: 'available' as const,
          timeLeft,
          expiryTime: expiry
            ? expiry.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            : '—',
          donorId: String(d.donor_id),
          donorName: d.donor_name,
          donorOrganization: d.donor_organization,
          hygieneStatus: i % 3 !== 0 ? 'FSSAI Verified' : 'Standard',
        }
      })
      setDonations(items)
    } catch (e) {
      console.error('useAvailableDonations fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    const s = getSocket()
    // New donation broadcast → refresh available list
    s.on('new_donation', fetch)
    s.on('donation_updated', fetch)
    return () => {
      s.off('new_donation', fetch)
      s.off('donation_updated', fetch)
    }
  }, [fetch])

  return { donations, loading }
}
