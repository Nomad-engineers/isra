'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/forms/login-form'
import { LoginFormData } from '@/lib/validations'
import { toast } from 'sonner'
import { sdk } from '@/lib/sdk'
import { setToken, isValidToken } from '@/lib/auth-utils'
import { googleOAuthV2 as googleOAuth } from '@/lib/google-oauth-v2'

export default function LoginPage() {
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
        // Valid state - process login
        processGoogleLogin(idToken)
      } else {
        toast.error('Invalid OAuth state')
      }

      // Clean up URL and session
      sessionStorage.removeItem('googleOAuthState')
      sessionStorage.removeItem('googleOAuthNonce')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const processGoogleLogin = async (idToken: string) => {
    try {
      setIsGoogleLoading(true)

      console.log('Processing Google login with idToken:', idToken.substring(0, 20) + '...')

      // Send idToken to backend via query parameters
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL || 'https://dev.isra-cms.nomad-engineers.space/api'}/api/users/google?idToken=${encodeURIComponent(idToken)}`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Google authentication failed')
      }

      const result = await response.json()

      // Save token and user data using our auth utilities
      if (result.token && isValidToken(result.token)) {
        // Save to localStorage
        setToken(result.token, result.user)

        // Also set server-side cookie with proper expiration
        const expires = new Date()
        expires.setTime(expires.getTime() + (2 * 60 * 60 * 1000)) // 2 hours
        document.cookie = `payload-token=${result.token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
      }

      // On successful login, redirect to rooms
      toast.success('Successfully logged in with Google!')
      router.push('/rooms')

    } catch (error) {
      console.error('Google login error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to login with Google')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleEmailLogin = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      // Direct API call instead of using SDK to avoid configuration issues
      const response = await fetch('https://dev.isra-cms.nomad-engineers.space/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.[0]?.message || 'Login failed')
      }

      const result = await response.json()

      // Save token and user data using our auth utilities
      if (result.token && isValidToken(result.token)) {
        // Save to localStorage
        setToken(result.token, result.user)

        // Also set server-side cookie with proper expiration
        const expires = new Date()
        expires.setTime(expires.getTime() + (2 * 60 * 60 * 1000)) // 2 hours
        document.cookie = `payload-token=${result.token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
      }

      // On successful login, redirect to rooms
      toast.success('Successfully logged in!')
      router.push('/rooms')
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Неверный email или пароль')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
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

      // Start Google OAuth flow (redirects to Google page)
      await googleOAuth.signIn()
      // The rest will be handled by the useEffect callback when user returns from Google
    } catch (error) {
      console.error('Google login error:', error)
      if (error instanceof Error) {
        if (error.message.includes('cancelled')) {
          toast.info('Google sign-in was cancelled')
        } else {
          toast.error(error.message)
        }
      } else {
        toast.error('Failed to login with Google')
      }
      throw error
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <LoginForm
      onSubmit={handleEmailLogin}
      onGoogleSignIn={handleGoogleLogin}
      loading={isLoading}
      googleLoading={isGoogleLoading}
    />
  )
}
