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
      const { confirmPassword, ...signupData } = data

      // Call our signup API endpoint
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle specific error messages
        if (response.status === 409) {
          throw new Error('User with this email already exists')
        } else if (response.status === 400 && result.details) {
          // Handle validation errors
          const validationErrors = result.details.map((err: any) => err.message).join(', ')
          throw new Error(validationErrors)
        } else {
          throw new Error(result.error || 'Failed to create account')
        }
      }

      // On successful signup, redirect to login page
      toast.success('Account created successfully! Please sign in to continue.')
      router.push('/auth/login')

    } catch (error) {
      console.error('Sign up error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account'
      toast.error(errorMessage)
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