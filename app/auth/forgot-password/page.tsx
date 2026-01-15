'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form'
import { ForgotPasswordFormData } from '@/lib/validations'
import { toast } from 'sonner'
import { BASE_URL } from '@/lib/constants'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)

    try {
      // Direct API call instead of using SDK to avoid configuration issues
      const response = await fetch(`${BASE_URL}/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.[0]?.message || 'Failed to send reset link')
      }

      // Show success message
      toast.success('Инструкции по восстановлению отправлены на вашу почту')

    } catch (error) {
      console.error('Forgot password error:', error)
      toast.error('Ошибка. Попробуйте снова.')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/auth/login')
  }

  return (
    <ForgotPasswordForm
      onSubmit={handleForgotPassword}
      loading={isLoading}
      onBackToLogin={handleBackToLogin}
    />
  )
}