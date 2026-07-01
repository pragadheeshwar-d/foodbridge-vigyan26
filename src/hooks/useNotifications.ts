/**
 * useNotifications — fetches from Flask REST API, updated via Socket.IO push.
 */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSocket } from '../lib/socket'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationRecord,
} from '../services/notificationService'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user?.id) {
      setNotifications([])
      setLoading(false)
      return
    }
    try {
      const items = await getNotifications()
      setNotifications(items)
    } catch (e) {
      console.error('useNotifications fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetch()

    const s = getSocket()

    // Server pushes a notification object directly
    const handlePush = (payload: any) => {
      const newNotif: NotificationRecord = {
        id: payload.id || Date.now(),
        title: payload.title || 'Notification',
        message: payload.message || '',
        type: payload.type,
        is_read: false,
        isRead: false,
        link: payload.link,
        created_at: new Date().toISOString(),
        createdAt: new Date(),
        userId: user?.id,
      }
      setNotifications((prev) => [newNotif, ...prev])
    }

    s.on('notification', handlePush)

    return () => {
      s.off('notification', handlePush)
    }
  }, [fetch, user?.id])

  const unreadCount = notifications.filter((n) => !n.is_read && !n.isRead).length

  const markAsRead = async (id: string | number) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) =>
          String(n.id) === String(id) ? { ...n, is_read: true, isRead: true } : n
        )
      )
    } catch (e) {
      console.error('markAsRead error:', e)
    }
  }

  const markAllRead = async () => {
    if (unreadCount === 0) return
    try {
      await markAllNotificationsRead()
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, isRead: true }))
      )
    } catch (e) {
      console.error('markAllRead error:', e)
    }
  }

  return { notifications, unreadCount, loading, markAsRead, markAllRead, refetch: fetch }
}
