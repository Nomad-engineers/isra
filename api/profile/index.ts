import { ApiClient } from '@/lib/api-client'
import { UserProfile, UpdateProfileData, ChangePasswordData, UserStats } from '@/types/user'

export class ProfileApi {
  private client = new ApiClient()

  async getProfile(): Promise<UserProfile> {
    return await this.client.get<UserProfile>('/profile')
  }

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    return await this.client.patch<UserProfile>('/profile', data)
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    return await this.client.post<void>('/profile/change-password', data)
  }

  async getStats(): Promise<UserStats> {
    return await this.client.get<UserStats>('/profile/stats')
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/avatar`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Ошибка при загрузке аватара')
    }

    return response.json()
  }
}

export const profileApi = new ProfileApi()