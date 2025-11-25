'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocalStorage } from '@/hooks/use-local-storage'

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * AuthGuard component to handle client-side authentication redirects.
 *
 * This component:
 * - Checks for JWT token in localStorage
 * - Redirects based on authentication status
 * - Works in conjunction with middleware.ts for complete auth coverage
 *
 * Usage: Wrap your root layout or app component with this guard
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Get token from localStorage
  const [token] = useLocalStorage<string>('payload-token', '')

  useEffect(() => {
    // Skip auth logic for API routes and static assets
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.includes('.')
    ) {
      return
    }

    // Define protected and auth paths
    const protectedPaths = ['/']
    const authPaths = ['/auth/login', '/auth/signup', '/auth/forgot-password']

    const hasToken = Boolean(token)

    // If user is on auth pages and has token, redirect to rooms
    if (authPaths.some(path => pathname.startsWith(path)) && hasToken) {
      router.replace('/rooms')
      return
    }

    // If user is on protected paths and has no token, redirect to login
    if (protectedPaths.some(path => pathname === path) && !hasToken) {
      router.replace('/auth/login')
      return
    }

    // Special handling for root path
    if (pathname === '/') {
      if (hasToken) {
        router.replace('/rooms')
      } else {
        router.replace('/auth/login')
      }
      return
    }
  }, [pathname, token, router])

  // Add token to all client-side requests via fetch interceptor
  useEffect(() => {
    // Store original fetch
    const originalFetch = window.fetch

    // Override fetch to add auth token
    window.fetch = async (...args) => {
      const [url, options = {}] = args

      // Add token to request headers for our API
      if (token && typeof url === 'string' && url.startsWith('/')) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'x-local-storage-token': token, // Custom header for middleware
        }
      }

      return originalFetch(url, options)
    }

    // Cleanup on unmount
    return () => {
      window.fetch = originalFetch
    }
  }, [token])

  return <>{children}</>
}