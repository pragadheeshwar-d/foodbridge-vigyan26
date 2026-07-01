/**
 * useChat — backed by Flask REST API + Socket.IO real-time messages.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSocket } from '../lib/socket'
import {
  getConversations,
  getMessages,
  sendMessage,
  type ConversationRecord,
} from '../services/chatService'
import type { ChatMessageRecord } from '../lib/types'

export interface ChatThread {
  id: string                // String(partner.id)
  participants: { id: string; name: string; role: string }[]
  lastMessagePreview?: string
  lastMessageAt?: Date
  unread_count?: number
}

export function useChat() {
  const { user } = useAuth()
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessageRecord[]>([])
  const activeRef = useRef(activeThreadId)
  activeRef.current = activeThreadId

  // ── Load conversation list ─────────────────────────────────────────────────
  const loadThreads = useCallback(async () => {
    if (!user?.id) return
    try {
      const convos: ConversationRecord[] = await getConversations()
      const mapped: ChatThread[] = convos.map((c) => ({
        id: String(c.partner.id),
        participants: [
          { id: String(user.id), name: user.name, role: user.role },
          { id: String(c.partner.id), name: c.partner.name, role: c.partner.role },
        ],
        lastMessagePreview: c.last_message?.message,
        lastMessageAt: c.last_message?.created_at
          ? new Date(c.last_message.created_at)
          : undefined,
        unread_count: c.unread_count,
      }))
      // Sort by latest message
      mapped.sort((a, b) => (b.lastMessageAt?.getTime() ?? 0) - (a.lastMessageAt?.getTime() ?? 0))
      setThreads(mapped)

      if (!activeThreadId && mapped.length > 0) {
        setActiveThreadId(mapped[0].id)
      }
    } catch (e) {
      console.error('useChat loadThreads error:', e)
    }
  }, [user?.id, activeThreadId])

  // ── Load messages for active thread ───────────────────────────────────────
  const loadMessages = useCallback(async (partnerId: string) => {
    try {
      const msgs = await getMessages(partnerId)
      setMessages(msgs)
    } catch (e) {
      console.error('useChat loadMessages error:', e)
    }
  }, [])

  useEffect(() => {
    loadThreads()
  }, [loadThreads])

  useEffect(() => {
    if (!activeThreadId) { setMessages([]); return }
    loadMessages(activeThreadId)
  }, [activeThreadId, loadMessages])

  // ── Socket.IO: receive new messages in real-time ───────────────────────────
  useEffect(() => {
    if (!user?.id) return
    const s = getSocket()

    const handleNewMessage = (msg: any) => {
      const parsed: ChatMessageRecord = {
        id: String(msg.id),
        threadId: `${Math.min(msg.sender_id, msg.receiver_id)}_${Math.max(msg.sender_id, msg.receiver_id)}`,
        senderId: String(msg.sender_id),
        senderName: msg.sender_name || '',
        senderRole: 'donor',
        text: msg.message,
        createdAt: new Date(msg.created_at),
        readBy: [],
      }

      const partnerId = String(
        msg.sender_id === Number(user.id) ? msg.receiver_id : msg.sender_id
      )

      // If the message belongs to the active thread, append it
      if (activeRef.current === partnerId) {
        setMessages((prev) => [...prev, parsed])
      }

      // Refresh thread list to update last message preview
      loadThreads()
    }

    s.on('new_message', handleNewMessage)
    return () => {
      s.off('new_message', handleNewMessage)
    }
  }, [user?.id, loadThreads])

  const sendMsg = async (text: string) => {
    if (!user || !activeThreadId || !text.trim()) return
    try {
      await sendMessage(activeThreadId, text.trim())
      // Optimistically append our own message
      const optimistic: ChatMessageRecord = {
        id: String(Date.now()),
        threadId: activeThreadId,
        senderId: String(user.id),
        senderName: user.name,
        senderRole: user.role as any,
        text: text.trim(),
        createdAt: new Date(),
        readBy: [String(user.id)],
      }
      setMessages((prev) => [...prev, optimistic])
      loadThreads()
    } catch (e) {
      console.error('useChat sendMessage error:', e)
    }
  }

  const activeThread = threads.find((t) => t.id === activeThreadId)

  const getOtherParticipant = (thread: ChatThread) =>
    thread.participants.find((p) => p.id !== String(user?.id)) || thread.participants[0]

  return {
    threads,
    activeThreadId,
    setActiveThreadId,
    messages,
    sendMessage: sendMsg,
    activeThread,
    getOtherParticipant,
    user,
    loadThreads,
  }
}
