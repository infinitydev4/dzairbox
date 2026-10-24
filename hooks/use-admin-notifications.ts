import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface AdminNotification {
  id: string
  type: "business_pending" | "user_new" | "report_ready"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export function useAdminNotifications() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session?.user || session.user.role !== "ADMIN") return
    let cancelled = false

    async function loadNotifications() {
      try {
        const response = await fetch("/api/admin/notifications")
        if (!response.ok || cancelled) return
        const data = await response.json()
        if (cancelled) return
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadNotifications()
    const interval = setInterval(() => {
      void loadNotifications()
    }, 30000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [session])

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ read: true }),
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/admin/notifications/mark-all-read", {
        method: "POST",
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const refetch = async () => {
    if (!session?.user || session.user.role !== "ADMIN") return
    try {
      const response = await fetch("/api/admin/notifications")
      if (!response.ok) return
      const data = await response.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch
  }
} 