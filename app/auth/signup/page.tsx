'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SignUpForm } from '@/components/forms/signup-form'
import { SignUpFormData } from '@/lib/validations'
import { toast } from 'sonner'
import { googleOAuthV2 as googleOAuth } from '@/lib/google-oauth-v2'
import { setToken, isValidToken } from '@/lib/auth-utils'

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  // Handle Google OAuth callback when returning from Google
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))

    const idToken = urlParams.get('id_token') || hashParams.get('id_token')
    const state = urlParams.get('state') || hashParams.get('state')

    if (idToken && state) {
      // We're returning from Google OAuth
      const storedState = sessionStorage.getItem('googleOAuthState')

      if (state === storedState) {
        // Valid state - process signup
        processGoogleSignup(idToken)
      } else {
        toast.error('Invalid OAuth state')
      }

      // Clean up URL and session
      sessionStorage.removeItem('googleOAuthState')
      sessionStorage.removeItem('googleOAuthNonce')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const processGoogleSignup = async (idToken: string) => {
    try {
      setIsGoogleLoading(true)

      console.log('Processing Google signup with idToken:', idToken.substring(0, 20) + '...')

      // Send idToken to backend via query parameters
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL || 'https://dev.isra-cms.nomad-engineers.space/api'}/api/users/google?idToken=${encodeURIComponent(idToken)}`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        // Handle existing user case
        if (response.status === 409) {
          toast.error('An account with this email already exists. Please sign in instead.')
          router.push('/auth/login')
          return
        }

        throw new Error(errorData.message || 'Google authentication failed')
      }

      const result = await response.json()

      // Save token and user data using existing auth utilities
      if (result.token && isValidToken(result.token)) {
        setToken(result.token, result.user)
      }

      // On successful sign up, redirect to rooms
      toast.success('Account created successfully with Google!')
      router.push('/rooms')

    } catch (error) {
      console.error('Google signup error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create account with Google')
    } finally {
      setIsGoogleLoading(false)
    }
  }

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
        await googleOAuth.initialize({
          client_id: clientId,
          redirect_uri: window.location.origin + '/auth/signup'
        })
      }

      // Start Google OAuth flow (redirects to Google page)
      await googleOAuth.signIn()
      // The rest will be handled by the useEffect callback when user returns from Google

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