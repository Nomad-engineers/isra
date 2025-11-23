export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface NameEntity extends BaseEntity {
  name: string
  description?: string
}

export interface StatusEntity extends BaseEntity {
  active: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
}

export type PaginationParams = {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type FilterParams = {
  search?: string
  active?: boolean
  [key: string]: any
}

export type ListParams = PaginationParams & FilterParams

export interface BaseFormData {
  name: string
  description?: string
  active?: boolean
}