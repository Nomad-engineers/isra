import { BaseEntity } from './common'

export interface Room extends BaseEntity {
  id: string
  title: string
  description?: string
  user: number | string // User ID who owns the room
  createdAt: string
  updatedAt: string
}

export interface RoomResponse {
  docs: Room[]
  totalDocs?: number
  limit?: number
  offset?: number
  totalPages?: number
  page?: number
  pagingCounter?: number
  hasPrevPage?: boolean
  hasNextPage?: boolean
  prevPage?: number | null
  nextPage?: number | null
}

export interface CreateRoomData {
  title: string
  description?: string
}

export type UpdateRoomData = Partial<CreateRoomData>