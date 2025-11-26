'use client'

import { useState, useEffect } from 'react'
import { TokenAuthentication } from '@/lib/token-authentication'

/**
 * Hook for accessing authentication token and status
 * Replaces direct localStorage.getItem("payload-token") calls
 */
export function useTokenAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const updateAuthStatus = () => {
      try {
        const authStatus = TokenAuthentication.getClientAuthStatus()
        setToken(authStatus.token)
        setIsAuthenticated(authStatus.isAuthenticated)
      } catch (error) {
        console.error('Error updating auth status:', error)
        setToken(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    // Initial check
    updateAuthStatus()

    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'payload-token') {
        updateAuthStatus()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  /**
   * Get the current token (replaces localStorage.getItem("payload-token"))
   */
  const getToken = () => token

  /**
   * Check if user is authenticated
   */
  const checkAuth = () => isAuthenticated

  /**
   * Handle login
   */
  const login = (authToken: string, userData?: any) => {
    try {
      TokenAuthentication.handleLogin(authToken, userData)
      setToken(authToken)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  /**
   * Handle logout
   */
  const logout = () => {
    try {
      TokenAuthentication.handleLogout()
      setToken(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  return {
    token,
    isAuthenticated,
    isLoading,
    getToken,
    checkAuth,
    login,
    logout
  }
}