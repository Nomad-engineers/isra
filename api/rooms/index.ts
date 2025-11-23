import { ApiClient } from '@/lib/api-client'
import { Webinar, CreateWebinarData, UpdateWebinarData, WebinarStats } from '@/types/webinar'

export class RoomsApi {
  private client = new ApiClient()

  async getAll(params?: Record<string, any>): Promise<Webinar[]> {
    return await this.client.get<Webinar[]>('/rooms', params)
  }

  async getById(id: string): Promise<Webinar> {
    return await this.client.get<Webinar>(`/rooms/${id}`)
  }

  async create(data: CreateWebinarData): Promise<Webinar> {
    return await this.client.post<Webinar>('/rooms', data)
  }

  async update(id: string, data: UpdateWebinarData): Promise<Webinar> {
    return await this.client.patch<Webinar>(`/rooms/${id}`, data)
  }

  async delete(id: string): Promise<void> {
    return await this.client.delete(`/rooms/${id}`)
  }

  async getStats(): Promise<WebinarStats> {
    return await this.client.get<WebinarStats>('/rooms/stats')
  }

  async duplicate(id: string): Promise<Webinar> {
    return await this.client.post<Webinar>(`/rooms/${id}/duplicate`)
  }

  async start(id: string): Promise<{ roomUrl: string }> {
    return await this.client.post<{ roomUrl: string }>(`/rooms/${id}/start`)
  }

  async end(id: string): Promise<void> {
    return await this.client.post<void>(`/rooms/${id}/end`)
  }
}

export const roomsApi = new RoomsApi()