'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignUpForm } from '@/components/forms/signup-form'
import { SignUpFormData } from '@/lib/validations'
import { toast } from 'sonner'

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const handleEmailSignUp = async (data: SignUpFormData) => {
    setIsLoading(true)

    try {
      // TODO: Implement actual API call
      const { confirmPassword, ...signupData } = data
      console.log('Sign up with email:', signupData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // On successful signup, redirect to verification page or login
      toast.success('Account created successfully! Please check your email to verify your account.')
      router.push('/login')

    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)

    try {
      // TODO: Implement Google OAuth
      console.log('Sign up with Google')

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // On successful signup, redirect to dashboard or intended page
      toast.success('Account created successfully with Google!')
      router.push('/profile')

    } catch (error) {
      console.error('Google sign up error:', error)
      throw error
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <SignUpForm
      onSubmit={handleEmailSignUp}
      onGoogleSignUp={handleGoogleSignUp}
      loading={isLoading}
      googleLoading={isGoogleLoading}
    />
  )
}