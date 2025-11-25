'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignUpForm } from '@/components/forms/signup-form'
import { SignUpFormData } from '@/lib/validations'
import { toast } from 'sonner'
import { googleOAuthFixed as googleOAuth } from '@/lib/google-oauth-fixed'
import { setToken, isValidToken } from '@/lib/auth-utils'

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
      // Initialize Google OAuth if not already done
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!clientId) {
        throw new Error('Google OAuth not configured. Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID.')
      }

      if (!googleOAuth.isReady()) {
        await googleOAuth.initialize({ client_id: clientId })
      }

      // Mark this as signup flow
      sessionStorage.setItem('googleSignUpFlow', 'true')

      // Start Google OAuth flow (redirects to Google)
      // The rest will be handled by the callback page
      await googleOAuth.signIn()

    } catch (error) {
      console.error('Google sign up error:', error)
      if (error instanceof Error) {
        if (error.message.includes('cancelled')) {
          toast.info('Google sign-up was cancelled')
        } else {
          toast.error(error.message)
        }
      } else {
        toast.error('Failed to create account with Google')
      }
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