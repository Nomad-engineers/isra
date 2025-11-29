'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface EnhancedAuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

/**
 * Simplified AuthGuard component working directly with localStorage
 * Provides basic authentication logic without complex middleware
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

        // Simple token check in localStorage
        const token = localStorage.getItem('payload-token')
        const isAuth = Boolean(token && token.length > 0)
        setIsAuthenticated(isAuth)

        // If authentication is required and user is not authenticated
        if (requireAuth && !isAuth) {
          const redirectPath = redirectTo || '/auth/login'
          if (pathname !== redirectPath) {
            router.push(redirectPath)
          }
          return
        }

        // If user is authenticated but on an auth page, redirect to rooms
        if (isAuth && pathname.startsWith('/auth/')) {
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
  const [authStatus, setAuthStatus] = useState<{
    isAuthenticated: boolean
    token: string | null
    error: string | null
  }>(() => {
    const token = localStorage.getItem('payload-token')
    const isAuthenticated = Boolean(token && token.length > 0)
    return {
      isAuthenticated,
      token,
      error: null
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  const refreshAuthStatus = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('payload-token')
      const isAuthenticated = Boolean(token && token.length > 0)
      setAuthStatus({
        isAuthenticated,
        token,
        error: null
      })
    } catch (error) {
      console.error('Error refreshing auth status:', error)
      setAuthStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
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