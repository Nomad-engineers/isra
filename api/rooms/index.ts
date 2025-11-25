import { ApiClient } from '@/lib/api-client'
import { Room, RoomResponse, CreateRoomData, UpdateRoomData } from '@/types/room'
import { Webinar, CreateWebinarData } from '@/types/webinar'

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

  // Utility methods
  async start(id: string): Promise<{ roomUrl: string }> {
    return await this.client.post<{ roomUrl: string }>(`/rooms/${id}/start`)
  }

  async end(id: string): Promise<void> {
    return await this.client.post<void>(`/rooms/${id}/end`)
  }
}

export const roomsApi = new RoomsApi()