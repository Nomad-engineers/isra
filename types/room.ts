import { BaseEntity } from './common'

export interface User {
  id: number
  lastName?: string | null
  firstName?: string | null
  role: string
  phone?: string | null
  isPhoneVerified: boolean
  updatedAt: string
  createdAt: string
  email: string
  sessions: Array<{
    id: string
    createdAt: string
    expiresAt: string
  }>
}

export interface Room extends BaseEntity {
  id: string
  name: string
  title?: string // Optional for backward compatibility
  description?: string
  speaker: string
  type: 'live' | 'auto'
  user: User // User object who owns the room
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