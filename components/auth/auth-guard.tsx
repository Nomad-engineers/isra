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
    // Store original fetch with proper binding to prevent recursion
    const originalFetch = globalThis.fetch.bind(globalThis)

    // Override fetch to add auth token
    const interceptedFetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
      const [url, options = {}] = args

      // Skip intercepting for local Next.js API routes that don't need auth
      const isInternalRoute =
        typeof url === 'string' && (
          url.startsWith(window.location.origin + '/api/users/') ||
          url.startsWith('/api/upload/') ||
          (url.startsWith('/api/') && !url.includes('/users/me'))
        )

      if (isInternalRoute) {
        return await originalFetch(url, options)
      }

      // Add token to request headers for our API
      if (token && typeof url === 'string') {
        // Handle both relative URLs and Payload CMS URLs
        const isOurApi = url.startsWith('/') || url.includes('isracms.vercel.app')

        if (isOurApi) {
          options.headers = {
            ...options.headers,
            'Authorization': `JWT ${token}`, // Use JWT format for Payload CMS
            'x-local-storage-token': token, // Custom header for middleware
          }
        }
      }

      try {
        return await originalFetch(url, options)
      } catch (error) {
        console.error('Fetch error:', error)
        throw error
      }
    }

    // Override global fetch with our intercepted version
    globalThis.fetch = interceptedFetch

    // Cleanup on unmount - restore original fetch
    return () => {
      globalThis.fetch = originalFetch
    }
  }, [token])

  return <>{children}</>
}