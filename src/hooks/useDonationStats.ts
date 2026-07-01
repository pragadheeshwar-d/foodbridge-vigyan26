/**
 * Donor-side hooks — fetch from Flask REST API with Socket.IO live updates.
 */
import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api'
import { getSocket } from '../lib/socket'
import { useAuth } from '../context/AuthContext'

// ─── Donor Dashboard Stats ────────────────────────────────────────────────────

export function useDonationStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalMeals: 0,
    totalKg: 0,
    todayDonations: 0,
    pendingPickups: 0,
    expiringSoon: 0,
    totalDonationEvents: 0,
    foodWastePrevented: 0,
    carbonReduced: 0,
    certificates: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await api.get('/dashboard/donor')
      const s = res.data.stats
      setStats({
        totalMeals: s.meals_donated ?? 0,
        totalKg: s.food_waste_prevented ?? 0,
        todayDonations: s.todays_donations ?? 0,
        pendingPickups: s.pending_pickups ?? 0,
        expiringSoon: 0,
        totalDonationEvents: s.total_donations ?? 0,
        foodWastePrevented: s.food_waste_prevented ?? 0,
        carbonReduced: s.carbon_reduced ?? 0,
        certificates: s.certificates ?? 0,
      })
    } catch (e) {
      console.error('useDonationStats fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetch()
    const s = getSocket()
    const refresh = () => fetch()
    s.on('pickup_status_changed', refresh)
    s.on('analytics_updated', refresh)
    s.on('new_donation', refresh)
    return () => {
      s.off('pickup_status_changed', refresh)
      s.off('analytics_updated', refresh)
      s.off('new_donation', refresh)
    }
  }, [fetch])

  return { stats, loading }
}

// ─── Donor Donations List ─────────────────────────────────────────────────────

export function useDonorDonations() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    try {
      const res = await api.get('/donations/', {
        params: { donor_id: user.id },
      })
      const items = res.data.map((d: any) => ({
        id: String(d.id),
        ...d,
        createdAt: d.created_at ? new Date(d.created_at) : new Date(),
        expiryTimeDate: d.expiry_time ? new Date(d.expiry_time) : null,
        food: d.food_name || d.food_type || 'Food',
        category: d.veg_type === 'veg' ? 'Vegetarian' : d.veg_type === 'vegan' ? 'Vegan' : 'Non-Veg',
        meals: d.unit === 'kg'
          ? Math.round((d.quantity_number || 0) * 2)
          : (d.quantity_number || 0),
        receiver: d.receiver_name || 'Unassigned',
        pickupTime: d.pickup_address || '—',
        expiryTime: d.expiry_time
          ? new Date(d.expiry_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
          : '—',
        image: d.image || 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
      }))
      setDonations(items)
    } catch (e) {
      console.error('useDonorDonations fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetch()
    const s = getSocket()
    s.on('donation_updated', fetch)
    s.on('pickup_status_changed', fetch)
    return () => {
      s.off('donation_updated', fetch)
      s.off('pickup_status_changed', fetch)
    }
  }, [fetch])

  return { donations, loading }
}

// ─── Donor Pickup Requests List ───────────────────────────────────────────────

export function useDonorPickups() {
  const { user } = useAuth()
  const [pickups, setPickups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    try {
      const res = await api.get('/pickups/')
      const items = res.data.map((pr: any) => ({
        id: String(pr.id),
        donationId: String(pr.donation_id),
        ngo: pr.receiver_organization || pr.receiver_name || 'Unknown',
        food: pr.food_type || pr.donation?.food_name || 'Food',
        time: pr.donation?.pickup_time
          ? new Date(pr.donation.pickup_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
          : pr.donation?.preferred_pickup_time || '—',
        status: (pr.status || 'Pending').toLowerCase(),
        quantity: pr.quantity,
        unit: pr.unit,
        pickupAddress: pr.pickup_address,
      }))
      setPickups(items)
    } catch (e) {
      console.error('useDonorPickups fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetch()
    const s = getSocket()
    s.on('pickup_requested', fetch)
    s.on('pickup_status_changed', fetch)
    return () => {
      s.off('pickup_requested', fetch)
      s.off('pickup_status_changed', fetch)
    }
  }, [fetch])

  return { pickups, loading }
}
