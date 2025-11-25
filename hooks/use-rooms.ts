"use client"

import { useState, useEffect, useCallback } from "react"
import { Room, RoomResponse } from "@/types/room"
import { toast } from "sonner"

interface UseRoomsOptions {
  userId?: string | number
  autoFetch?: boolean
}

export function useRooms(options: UseRoomsOptions = {}) {
  const { userId, autoFetch = true } = options

  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = useCallback(async (targetUserId?: string | number) => {
    const effectiveUserId = targetUserId || userId

    if (!effectiveUserId) {
      const errorMessage = "User ID is required to fetch rooms"
      setError(errorMessage)
      toast.error(errorMessage)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const url = `https://isracms.vercel.app/api/rooms?where[user][equals]=${effectiveUserId}`

      const response = await fetch(url, {
        method: "GET",
        credentials: "include", // Important: include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message ||
          errorData.error?.message ||
          `API Error: ${response.status} ${response.statusText}`
        )
      }

      const result: RoomResponse = await response.json()

      if (result.docs && Array.isArray(result.docs)) {
        setRooms(result.docs)
      } else {
        console.warn("Unexpected API response format:", result)
        setRooms([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch rooms"
      setError(errorMessage)
      toast.error(errorMessage)
      console.error("Rooms fetch error:", err)

      // Set empty rooms array on error
      setRooms([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Auto-fetch on mount if userId is provided
  useEffect(() => {
    if (autoFetch && userId) {
      fetchRooms()
    }
  }, [autoFetch, userId, fetchRooms])

  const refetch = useCallback(() => {
    return fetchRooms()
  }, [fetchRooms])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    rooms,
    loading,
    error,
    fetchRooms,
    refetch,
    clearError,
  }
}