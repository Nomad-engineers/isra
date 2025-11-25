'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/forms/login-form'
import { LoginFormData } from '@/lib/validations'
import { toast } from 'sonner'
import { sdk } from '@/lib/sdk'
import { setToken, isValidToken } from '@/lib/auth-utils'
import { googleOAuthV2 } from '@/lib/google-oauth-v2'

export default function SimpleLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const handleEmailLogin = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      // Direct API call instead of using SDK to avoid configuration issues
      const response = await fetch('https://isracms.vercel.app/api/users/login', {
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
        setToken(result.token, result.user)
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

      if (!googleOAuthV2.isReady()) {
        await googleOAuthV2.initialize({ client_id: clientId })
      }

      // Start Google OAuth flow (returns idToken directly)
      const { idToken } = await googleOAuthV2.signIn()

      console.log('Got idToken:', idToken.substring(0, 20) + '...')

      // Send idToken to backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL || 'https://isracms.vercel.app'}/api/auth/google`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: idToken,
            isSignUp: false,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Google authentication failed')
      }

      const result = await response.json()

      // Save token and user data using existing auth utilities
      if (result.token && isValidToken(result.token)) {
        setToken(result.token, result.user)
      }

      // On successful login, redirect to rooms
      toast.success('Successfully logged in with Google!')
      router.push('/rooms')

    } catch (error) {
      console.error('Google login error:', error)
      if (error instanceof Error) {
        if (error.message.includes('cancelled') || error.message.includes('timed out')) {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Simple Google OAuth Test
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Test page for Google OAuth
          </p>
        </div>

        <LoginForm
          onSubmit={handleEmailLogin}
          onGoogleSignIn={handleGoogleLogin}
          loading={isLoading}
          googleLoading={isGoogleLoading}
        />

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/auth/login')}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ← Back to regular login
          </button>
        </div>
      </div>
    </div>
  )
}