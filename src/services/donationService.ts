/**
 * Donation service — all calls go to Flask REST API.
 */
import api from '../lib/api'

export type DonationVegType = 'veg' | 'nonveg' | 'vegan'
export type DonationUnit = 'meals' | 'kg'

export interface DonationRecord {
  id?: string | number
  donor_id?: number
  donor_name?: string
  donor_organization?: string
  food_name: string
  food_type: string
  category?: string
  veg_type?: DonationVegType
  image?: string
  quantity: number
  unit: DonationUnit
  preparation_time?: string
  preferred_pickup_time?: string
  special_instructions?: string
  expiry_time: string        // ISO string
  pickup_time?: string       // ISO string
  pickup_address: string
  latitude?: number
  longitude?: number
  status?: string
  created_at?: string
}

export async function addDonation(
  donation: Omit<DonationRecord, 'id' | 'status' | 'donor_id'> & {
    donorId?: string
    donorName?: string
    donorOrganization?: string
    foodType?: string
    imageUrl?: string
    preferredPickupTime?: string
    specialInstructions?: string
    expiryTime?: Date | string
    pickupAddress?: string
    vegType?: DonationVegType
  }
): Promise<string | number> {
  // Normalise field names — frontend uses camelCase, API uses snake_case
  const payload = {
    food_name:            donation.food_name  || donation.foodType || '',
    food_type:            donation.food_type  || donation.foodType || '',
    category:             donation.category,
    veg_type:             donation.veg_type   || donation.vegType,
    quantity:             donation.quantity,
    unit:                 donation.unit,
    preparation_time:     donation.preparation_time || (donation as any).preparationTime,
    preferred_pickup_time: donation.preferred_pickup_time || (donation as any).preferredPickupTime,
    special_instructions: donation.special_instructions || (donation as any).specialInstructions,
    image:                donation.image || (donation as any).imageUrl,
    expiry_time:          donation.expiry_time
                            || ((donation as any).expiryTime instanceof Date
                                ? (donation as any).expiryTime.toISOString()
                                : (donation as any).expiryTime),
    pickup_address:       donation.pickup_address || (donation as any).pickupAddress,
    latitude:             donation.latitude,
    longitude:            donation.longitude,
  } as Record<string, unknown>

  // Attach preparationTime property used by some callers
  const prep = (donation as any).preparationTime
  if (prep) {
    payload.preparation_time = prep
  }

  const res = await api.post('/donations/', payload)
  return res.data.donation.id
}

export async function getDonations(params?: {
  status?: string
  donor_id?: string | number
}): Promise<DonationRecord[]> {
  const res = await api.get('/donations/', { params })
  return res.data
}

export async function getAvailableDonations(): Promise<DonationRecord[]> {
  const res = await api.get('/donations/available')
  return res.data
}

export async function updateDonation(
  id: string | number,
  updates: Partial<DonationRecord>
): Promise<DonationRecord> {
  const res = await api.put(`/donations/${id}`, updates)
  return res.data.donation
}

export async function deleteDonation(id: string | number): Promise<void> {
  await api.delete(`/donations/${id}`)
}
