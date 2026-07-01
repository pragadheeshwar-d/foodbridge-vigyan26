/**
 * Pickup request service — all calls go to Flask REST API.
 */
import api from '../lib/api'

export type PickupRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Completed'
  // Legacy aliases kept for UI compatibility
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'declined'
  | 'cancelled'
  | 'expired'

export interface PickupRequestRecord {
  id?: string | number
  donation_id?: string | number
  receiver_id?: number
  receiver_name?: string
  receiver_organization?: string
  status?: PickupRequestStatus
  requested_at?: string
  approved_at?: string
  completed_at?: string
  qr_token?: string
  // Enriched fields from donation
  food_type?: string
  quantity?: number
  unit?: string
  pickup_address?: string
  donor_name?: string
  donor_organization?: string
  donation?: any
  // Legacy camelCase (kept for UI hooks)
  donationId?: string
  donorId?: string
  donorName?: string
  donorOrganization?: string
  receiverId?: string
  receiverName?: string
  receiverOrganization?: string
  foodType?: string
  pickupAddress?: string
  pickupTime?: Date | null
  pickupTimeStr?: string
  createdAt?: Date
}

/** Receiver requests a pickup for a donation */
export async function createPickupRequest(input: {
  donationId: string | number
  donorId?: string | number
  donorName?: string
  donorOrganization?: string
  receiverId?: string | number
  receiverName?: string
  receiverOrganization?: string
  foodType?: string
  quantity?: number
  unit?: string
  pickupAddress?: string
  pickupTime?: Date | null
}): Promise<string | number> {
  const res = await api.post('/pickups/', {
    donation_id: input.donationId,
  })
  return res.data.pickup_request.id
}

/** Get all pickup requests for the current user */
export async function getPickupRequests(): Promise<PickupRequestRecord[]> {
  const res = await api.get('/pickups/')
  return res.data
}

/** Update pickup request status */
export async function updatePickupRequest(
  id: string | number,
  status: 'Approved' | 'Rejected' | 'Completed'
): Promise<PickupRequestRecord> {
  const res = await api.put(`/pickups/${id}`, { status })
  return res.data.pickup_request
}

/** Donor approves a pickup */
export async function donorApprovesPickup(id: string | number) {
  return updatePickupRequest(id, 'Approved')
}

/** Donor declines a pickup */
export async function donorDeclinesPickup(
  id: string | number,
  _donationId?: string | number
) {
  return updatePickupRequest(id, 'Rejected')
}

/** Receiver cancels / marks collected */
export async function receiverCancelsPickup(id: string | number) {
  return updatePickupRequest(id, 'Rejected')
}

/** Mark pickup completed */
export async function markPickupCompleted(
  id: string | number,
  _donationId?: string | number
) {
  return updatePickupRequest(id, 'Completed')
}

/** Generate QR code for an approved pickup */
export async function generateQRCode(pickupRequestId: string | number) {
  const res = await api.post(`/pickups/${pickupRequestId}/qr`)
  return res.data as { token: string; qr_image: string; pickup_request_id: number }
}

/** Verify a scanned QR token */
export async function verifyQRToken(token: string) {
  const res = await api.post('/pickups/qr/verify', { token })
  return res.data
}

/** List pickup requests for a donor (used in hooks) */
export async function listPickupRequestsForDonor(): Promise<PickupRequestRecord[]> {
  return getPickupRequests()
}
