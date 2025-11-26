'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { TokenAuthentication } from '@/lib/token-authentication'

interface EnhancedAuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

/**
 * Enhanced AuthGuard component using TokenAuthentication class
 * Provides centralized authentication logic for both client and server-side
 */
export function EnhancedAuthGuard({
  children,
  requireAuth = true,
  redirectTo
}: EnhancedAuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      try {
        setIsLoading(true)
        setError(null)

        const authStatus = TokenAuthentication.getClientAuthStatus()
        setIsAuthenticated(authStatus.isAuthenticated)

        // If authentication is required and user is not authenticated
        if (requireAuth && !authStatus.isAuthenticated) {
          const redirectPath = redirectTo || '/auth/login'
          if (pathname !== redirectPath) {
            router.push(redirectPath)
          }
          return
        }

        // If user is authenticated but on an auth page, redirect to rooms
        if (authStatus.isAuthenticated && pathname.startsWith('/auth/')) {
          router.push('/rooms')
          return
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication check failed'
        console.error('Authentication error:', errorMessage)
        setError(errorMessage)

        if (requireAuth) {
          router.push('/auth/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, pathname, requireAuth, redirectTo])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // If authentication is not required or user is authenticated, show children
  if (!requireAuth || isAuthenticated) {
    return <>{children}</>
  }

  // Fallback: show nothing while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

/**
 * Hook for checking authentication status
 */
export function useAuthStatus() {
  const [authStatus, setAuthStatus] = useState(() =>
    TokenAuthentication.getClientAuthStatus()
  )
  const [isLoading, setIsLoading] = useState(false)

  const refreshAuthStatus = async () => {
    setIsLoading(true)
    try {
      const status = TokenAuthentication.getClientAuthStatus()
      setAuthStatus(status)
    } catch (error) {
      console.error('Error refreshing auth status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    ...authStatus,
    isLoading,
    refreshAuthStatus
  }
}