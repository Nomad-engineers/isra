import { BaseEntity } from './common'

export interface UserProfile extends BaseEntity {
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  isEmailVerified: boolean
  lastLoginAt?: string
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  avatar?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UserStats {
  totalWebinars: number
  activeWebinars: number
  scheduledWebinars: number
  draftWebinars: number
  totalParticipants: number
  totalViews: number
}