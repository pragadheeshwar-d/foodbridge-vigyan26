import { useEffect, useMemo, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  type AchievementDefinition, type InsightSummary, type CertificateRecord,
  type DonorActivityItem, type HistoryRecord, type LiveOpsMarker,
} from '../lib/types'
import { useDonationStats, useDonorDonations } from './useDonationStats'
import api from '../lib/api'

export const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  { id: 'first_donation', title: 'First Donation', description: 'Complete your first donation', icon: '🌾', target: 1 },
  { id: 'ten_donations', title: '10 Donations', description: 'Complete 10 verified donations', icon: '📦', target: 10 },
  { id: 'hundred_donations', title: '100 Donations', description: 'Reach 100 lifetime donations', icon: '🏅', target: 100 },
  { id: 'meals_100', title: '100 Meals Saved', description: 'Rescue 100 meals from waste', icon: '🍽️', target: 100 },
  { id: 'meals_1000', title: '1,000 Meals Saved', description: 'Rescue 1,000 meals from waste', icon: '💰', target: 1000 },
  { id: 'co2_hero', title: 'Carbon Hero', description: 'Prevent 100 kg of CO₂ emissions', icon: '🌍', target: 100 },
  { id: 'community_champion', title: 'Community Champion', description: 'Partner with 5 verified NGOs', icon: '🤝', target: 5 },
]

export function useDonorHistory() {
  const { user } = useAuth()
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    try {
      const res = await api.get(`/donations/?donor_id=${user.id}&status=Completed`)
      const items = (res.data || []).map((d: any) => ({
        id: String(d.id),
        donorId: String(d.donor_id),
        foodType: d.food_name,
        meals: parseFloat(d.quantity?.split(' ')[0]) || 0,
        receiverName: d.receiver_name || 'NGO',
        status: 'completed',
        completedAt: new Date(d.updated_at || d.created_at),
        createdAt: new Date(d.created_at)
      }))
      setHistory(items)
    } catch (err) {
      console.error('Failed to fetch donor history', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { history, loading }
}

export function useDonorCertificates() {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState<CertificateRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    
    api.get('/services/certificates')
      .then(res => {
        const items = (res.data.certificates || []).map((c: any) => ({
          id: String(c.id),
          donorId: String(c.user_id),
          type: (c.title as any) || 'Food Donation',
          period: c.description || '',
          meals: c.metrics?.meals || 0,
          donations: c.metrics?.donations || 0,
          co2SavedKg: c.metrics?.co2Saved || 0,
          issuedAt: new Date(c.issued_at),
          organization: ''
        }))
        setCertificates(items)
      })
      .catch(err => console.error('Failed to fetch certificates', err))
      .finally(() => setLoading(false))
  }, [user?.id])

  return { certificates, loading }
}

export function useDonorActivity() {
  const { user } = useAuth()
  const [activity, setActivity] = useState<DonorActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchActivity = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    try {
      // In a real implementation, we'd have a specific activity endpoint.
      // For now, we'll fetch donations and pickups and construct a feed.
      const donRes = await api.get(`/donations/?donor_id=${user.id}`)
      const donations = donRes.data || []
      
      const feed: DonorActivityItem[] = donations.map((d: any) => ({
        id: `don_${d.id}`,
        donorId: String(d.donor_id),
        time: new Date(d.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        title: 'Donation Created',
        detail: `Listed ${d.quantity} of ${d.food_name}`,
        type: 'donation_created',
        createdAt: new Date(d.created_at)
      }))
      
      // Sort by descending createdAt
      feed.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      
      setActivity(feed.slice(0, 20))
    } catch (err) {
      console.error('Failed to fetch activity', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  return { activity, loading }
}

export function useDonorLiveOps() {
  const { user } = useAuth()
  const [markers, setMarkers] = useState<LiveOpsMarker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    // Fetch live ops from API if implemented, otherwise return empty
    setMarkers([])
    setLoading(false)
  }, [user?.id])

  return { markers, loading }
}

function computePeakWindow(donations: { createdAt: Date }[]): string {
  if (donations.length === 0) return 'No donations yet'
  const buckets = new Map<string, number>()
  donations.forEach((d) => {
    const key = `${d.createdAt.getHours()}:00`
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  })
  const [top] = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1])
  return top ? `Most pickups around ${top[0]}` : 'No donations yet'
}

function computeTopCategory(donations: { vegType?: string; category?: string }[]): string {
  if (donations.length === 0) return 'No data yet'
  const counts: Record<string, number> = {}
  donations.forEach((d) => {
    const key = d.category || d.vegType || 'Other'
    counts[key] = (counts[key] ?? 0) + 1
  })
  const [top] = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return top ? `Top category: ${top[0]}` : 'No data yet'
}

function generateRecommendation(expiringSoon: number, pendingPickups: number): string {
  if (expiringSoon > 0) return `${expiringSoon} donation(s) are expiring within 2 hours. Alert your partner NGOs now.`
  if (pendingPickups > 0) return `${pendingPickups} pickup request(s) are awaiting your approval.`
  return 'Log a new donation to receive personalized suggestions.'
}

function buildFallbackInsight(donorId: string, donations: { createdAt: Date; vegType?: string; category?: string }[], stats: { expiringSoon: number; pendingPickups: number }): InsightSummary {
  return {
    donorId,
    peakWindow: computePeakWindow(donations),
    topCategory: computeTopCategory(donations),
    recommendation: generateRecommendation(stats.expiringSoon, stats.pendingPickups),
    generatedAt: new Date(),
  }
}

export function useDonorInsights() {
  const { user } = useAuth()
  const { stats } = useDonationStats()
  const { donations } = useDonorDonations()
  const [insight, setInsight] = useState<InsightSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    
    // We'll use the fallback insight which computes locally based on API data
    const fakeData = buildFallbackInsight(user.id, donations, {
      expiringSoon: stats.expiringSoon,
      pendingPickups: stats.pendingPickups,
    })
    
    setInsight(fakeData)
    setLoading(false)
  }, [user?.id, donations, stats])

  const computed: InsightSummary = useMemo(() => {
    if (insight) return insight
    return buildFallbackInsight(user?.id ?? '', donations, {
      expiringSoon: stats.expiringSoon,
      pendingPickups: stats.pendingPickups,
    })
  }, [insight, donations, stats.expiringSoon, stats.pendingPickups, user?.id])

  return { insight: computed, loading: loading && !computed.donorId }
}

export function computeAchievements(
  stats: { totalMeals: number; totalDonationEvents: number },
  ngosHelped: number,
) {
  const co2Saved = stats.totalDonationEvents * 4.5
  return ACHIEVEMENT_CATALOG.map((def) => {
    let progress = 0
    switch (def.id) {
      case 'first_donation':
      case 'ten_donations':
      case 'hundred_donations':
        progress = stats.totalDonationEvents
        break
      case 'meals_100':
      case 'meals_1000':
        progress = stats.totalMeals
        break
      case 'co2_hero':
        progress = Math.round(co2Saved)
        break
      case 'community_champion':
        progress = ngosHelped
        break
    }
    const percent = Math.min(100, Math.round((progress / def.target) * 100))
    return { ...def, progress, percent, unlocked: progress >= def.target }
  })
}

export function useNgosHelpedByDonor() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (!user?.id) return
    api.get('/pickups/')
      .then(res => {
        const myPickups = (res.data || []).filter((p: any) => String(p.donor_id) === user.id)
        const uniq = new Set(myPickups.map((p: any) => String(p.receiver_id)))
        setCount(uniq.size)
      })
      .catch(err => console.error('Error fetching NGOs helped', err))
  }, [user?.id])
  
  return count
}

export async function upsertDonorActivity(activity: {
  donorId: string
  time: string
  title: string
  detail: string
  type: DonorActivityItem['type']
}) {
  // Can be implemented by posting to an activity endpoint on the API
  console.log('Donor activity upserted:', activity)
}
