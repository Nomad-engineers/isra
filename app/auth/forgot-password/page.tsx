'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form'
import { ForgotPasswordFormData } from '@/lib/validations'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)

    try {
      // TODO: Implement actual API call
      console.log('Send password reset email to:', data.email)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // The form will show the success message, we don't need to redirect here
      // The user can use the "Back to login" button when ready

    } catch (error) {
      console.error('Forgot password error:', error)
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