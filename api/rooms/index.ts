import { ApiClient } from '@/lib/api-client'
import { Room, RoomResponse, CreateRoomData, UpdateRoomData } from '@/types/room'
import { Webinar, CreateWebinarData, WebinarRoomStats } from '@/types/webinar'

export class RoomsApi {
  private client = new ApiClient()

  // Room operations
  async getAll(params?: Record<string, any>): Promise<RoomResponse> {
    return await this.client.get<RoomResponse>('/rooms', params)
  }

  async getById(id: string): Promise<Room> {
    return await this.client.get<Room>(`/rooms/${id}`)
  }

  async create(data: CreateRoomData): Promise<Room> {
    return await this.client.post<Room>('/rooms', data)
  }

  async update(id: string, data: UpdateRoomData): Promise<Room> {
    return await this.client.patch<Room>(`/rooms/${id}`, data)
  }

  async delete(id: string): Promise<void> {
    return await this.client.delete(`/rooms/${id}`)
  }

  // Webinar operations (using same /rooms endpoint per API requirements)
  async createWebinar(data: {
    name: string
    speaker: string
    type: 'live' | 'auto'
    videoUrl?: string
    description?: string
    scheduledDate?: string
  }): Promise<Webinar> {
    return await this.client.post<Webinar>('/rooms/create', data)
  }

  // Webinar stats methods
  async getWebinarStats(id: string): Promise<WebinarRoomStats> {
    // Prevent API call with empty ID
    if (!id) {
      return { onlineParticipants: 0, totalParticipants: 0 }
    }

    const chatApiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://144.76.109.45:8089'
    const token = typeof window !== 'undefined' ? localStorage.getItem('payload-token') : null

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `JWT ${token}`
    }

    const response = await fetch(`${chatApiUrl}/webinars/${id}/stats`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to get webinar stats: ${response.status}`)
    }

    return response.json()
  }

  // Utility methods
  async start(id: string): Promise<{ roomUrl: string }> {
    // Get the token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('payload-token') : null

    if (!token) {
      throw new Error('Authentication token is required')
    }

    // Use the Payload CMS API URL from environment configuration
    const apiUrl = process.env.NEXT_PUBLIC_PAYLOAD_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://isracms.vercel.app'

    // Make direct fetch call with Bearer token as specified in the curl command
    const response = await fetch(`${apiUrl}/api/rooms/start/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: '',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to start webinar: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async end(id: string): Promise<void> {
    return await this.client.post<void>(`/rooms/${id}/end`)
  }
}

export const roomsApi = new RoomsApi()
