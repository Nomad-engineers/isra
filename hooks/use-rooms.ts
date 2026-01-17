"use client";

import { useState, useEffect, useCallback } from "react";
import { Room, RoomResponse } from "@/types/room";
import { Webinar } from "@/types/webinar";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-fetch";

interface UseRoomsOptions {
  userId?: string | number;
  autoFetch?: boolean;
}

export function useRooms(options: UseRoomsOptions = {}) {
  const { userId, autoFetch = true } = options;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(
    async (targetUserId?: string | number) => {
      const effectiveUserId = targetUserId || userId;

      if (!effectiveUserId) {
        const errorMessage = "User ID is required to fetch rooms";
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get JWT token from localStorage
        const token = localStorage.getItem("payload-token");

        if (!token) {
          throw new Error("No authentication token found");
        }

        console.log("Making request to:", "/rooms/my");

        const result: RoomResponse = await apiFetch<RoomResponse>('/rooms/my', {
          headers: {
            Authorization: `JWT ${token}`,
          },
        });

        if (result.docs && Array.isArray(result.docs)) {
          setRooms(result.docs);
        } else {
          console.warn("Unexpected API response format:", result);
          setRooms([]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch rooms";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Rooms fetch error:", err);

        // Set empty rooms array on error
        setRooms([]);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Auto-fetch on mount if userId is provided
  useEffect(() => {
    if (autoFetch && userId) {
      fetchRooms();
    }
  }, [autoFetch, userId, fetchRooms]);

  const refetch = useCallback(() => {
    return fetchRooms();
  }, [fetchRooms]);

  const createWebinar = useCallback(
    async (data: {
      name: string;
      speaker: string;
      type: "live" | "auto";
      videoUrl?: string;
      description?: string;
      scheduledDate?: string;
    }): Promise<Webinar | null> => {
      setLoading(true);
      setError(null);

      try {
        // Get JWT token from localStorage
        const token = localStorage.getItem("payload-token");

        if (!token) {
          throw new Error("No authentication token found");
        }

        const result: Webinar = await apiFetch<Webinar>('/rooms/create', {
          method: "POST",
          headers: {
            Authorization: `JWT ${token}`,
          },
          body: JSON.stringify(data),
        });

        // Show success message
        toast.success("Вебинар успешно создан!");

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create webinar";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Webinar creation error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteRoom = useCallback(async (roomId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem("payload-token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      await apiFetch(`/rooms/${roomId}`, {
        method: "DELETE",
        headers: {
          Authorization: `JWT ${token}`,
        },
      });

      // Remove the deleted room from the local state
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));

      // Show success message
      toast.success("Комната успешно удалена!");

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete room";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Room deletion error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    rooms,
    loading,
    error,
    fetchRooms,
    refetch,
    clearError,
    createWebinar,
    deleteRoom,
  };
}
