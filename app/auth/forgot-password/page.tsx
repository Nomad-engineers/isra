'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form'
import { ForgotPasswordFormData } from '@/lib/validations'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api-fetch'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)

    try {

      await apiFetch('/users/forgot-password', {

        method: 'POST',
        body: JSON.stringify({
          email: data.email,
        }),
      })

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