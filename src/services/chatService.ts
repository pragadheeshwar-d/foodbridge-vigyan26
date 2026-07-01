/**
 * Chat service — all calls go to Flask REST API.
 * Real-time delivery via Socket.IO; REST is used for history and sending.
 */
import api from '../lib/api'
import type { ChatMessageRecord } from '../lib/types'

export interface ChatThread {
  id: string
  participants: { id: string; name: string; role: string }[]
  lastMessagePreview?: string
  lastMessageAt?: Date
  unread_count?: number
}

export interface ConversationRecord {
  partner: {
    id: number
    name: string
    organization?: string
    role: string
    profile_image?: string
  }
  last_message: {
    id: number
    sender_id: number
    receiver_id: number
    message: string
    created_at: string
    is_read: boolean
  } | null
  unread_count: number
}

export async function getConversations(): Promise<ConversationRecord[]> {
  const res = await api.get('/chat/conversations')
  return res.data
}

export async function getMessages(partnerId: string | number): Promise<ChatMessageRecord[]> {
  const res = await api.get(`/chat/messages/${partnerId}`)
  return res.data.map((m: any) => ({
    id: String(m.id),
    threadId: `${Math.min(m.sender_id, m.receiver_id)}_${Math.max(m.sender_id, m.receiver_id)}`,
    senderId: String(m.sender_id),
    senderName: m.sender_name || '',
    senderRole: 'donor' as const,
    text: m.message,
    createdAt: new Date(m.created_at),
    readBy: m.is_read ? [String(m.receiver_id)] : [],
  }))
}

export async function sendMessage(
  receiverId: string | number,
  message: string
): Promise<ChatMessageRecord> {
  const res = await api.post('/chat/messages', {
    receiver_id: receiverId,
    message,
  })
  const m = res.data.data
  return {
    id: String(m.id),
    threadId: `${Math.min(m.sender_id, m.receiver_id)}_${Math.max(m.sender_id, m.receiver_id)}`,
    senderId: String(m.sender_id),
    senderName: '',
    senderRole: 'donor',
    text: m.message,
    createdAt: new Date(m.created_at),
    readBy: [],
  }
}

export async function getChatUsers() {
  const res = await api.get('/chat/users')
  return res.data
}

/** Legacy compatibility helpers (used by useChat hook) */
export function threadIdFor(donationId: string, participantId: string): string {
  return `${donationId}__${participantId}`
}

export async function ensureChatThread(
  _threadId: string,
  _participants: { id: string; name: string; role: string }[]
): Promise<void> {
  // No-op: Flask backend uses direct user messaging, not threads
}

export async function postChatMessage(input: {
  threadId: string
  senderId: string
  senderName: string
  senderRole: 'donor' | 'receiver' | 'admin'
  text: string
}): Promise<string> {
  // threadId pattern: "donationId__receiverId" — extract partner id from context
  // We call the REST API directly via sendMessage
  const parts = input.threadId.split('__')
  const partnerId = parts[1] || parts[0]
  const res = await api.post('/chat/messages', {
    receiver_id: partnerId,
    message: input.text,
  })
  return String(res.data.data.id)
}

export function listenToThread(
  _threadId: string,
  _onChange: (msgs: ChatMessageRecord[]) => void
): () => void {
  return () => {}
}

export function listenToUserThreads(
  _userId: string,
  _onChange: (threads: ChatThread[]) => void
): () => void {
  return () => {}
}
