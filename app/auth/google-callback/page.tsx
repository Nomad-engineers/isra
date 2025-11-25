'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { setToken, isValidToken } from '@/lib/auth-utils'
import { toast } from 'sonner'

export default function GoogleCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing Google authentication...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))

        // Check for id_token in URL params or hash fragment
        let idToken = urlParams.get('id_token') || hashParams.get('id_token')
        const state = urlParams.get('state') || hashParams.get('state')
        const errorParam = urlParams.get('error') || hashParams.get('error')

        // Handle OAuth errors
        if (errorParam) {
          throw new Error(`Google OAuth error: ${errorParam}`)
        }

        // Validate state for CSRF protection
        const storedState = sessionStorage.getItem('googleOAuthState')
        if (!state || state !== storedState) {
          throw new Error('Invalid OAuth state - possible CSRF attack')
        }

        if (!idToken) {
          throw new Error('No idToken received from Google')
        }

        setStatus('Authenticating with backend...')

        // Check if this was a signup flow
        const isSignUp = sessionStorage.getItem('googleSignUpFlow') === 'true'
        sessionStorage.removeItem('googleSignUpFlow')

        // Send idToken to backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_API_URL || 'https://isracms.vercel.app'}/api/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: idToken,
            isSignUp: isSignUp,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Backend authentication failed')
        }

        const result = await response.json()

        // Save token and user data
        if (result.token && isValidToken(result.token)) {
          setToken(result.token, result.user)
        }

        // Clean up
        sessionStorage.removeItem('googleOAuthState')
        sessionStorage.removeItem('googleOAuthNonce')

        setStatus('Authentication successful! Redirecting...')

        // Show success message
        toast.success('Successfully logged in with Google!')

        // Redirect to rooms after a short delay
        setTimeout(() => {
          router.push('/rooms')
        }, 1000)

      } catch (error) {
        console.error('Google callback error:', error)
        setError(error instanceof Error ? error.message : 'Authentication failed')
        setStatus('Authentication failed')

        // Show error message
        toast.error(error instanceof Error ? error.message : 'Google authentication failed')

        // Redirect to login after error
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    }

    handleGoogleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mb-4">
            {error ? (
              <div className="text-red-600">
                <svg className="mx-auto h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="mt-4 text-lg font-medium text-gray-900">Authentication Failed</h2>
                <p className="mt-2 text-sm text-gray-600">{error}</p>
                <p className="mt-2 text-sm text-gray-500">Redirecting to login page...</p>
              </div>
            ) : (
              <div className="text-blue-600">
                <svg className="mx-auto h-12 w-12 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <h2 className="mt-4 text-lg font-medium text-gray-900">Processing Authentication</h2>
                <p className="mt-2 text-sm text-gray-600">{status}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}