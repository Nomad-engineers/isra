'use client'

import { useState, useEffect } from 'react'

/**
 * Hook for accessing authentication token and status
 * Works directly with localStorage for simplicity
 */
export function useTokenAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const updateAuthStatus = () => {
      try {
        const storedToken = localStorage.getItem('payload-token')
        const isValid = Boolean(storedToken && storedToken.length > 0)

        setToken(storedToken)
        setIsAuthenticated(isValid)
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
      localStorage.setItem('payload-token', authToken)
      if (userData) {
        localStorage.setItem('user-data', JSON.stringify(userData))
      }
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
      localStorage.removeItem('payload-token')
      localStorage.removeItem('user-data')
      setToken(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  /**
   * Refresh the authentication token
   */
  const refreshToken = async () => {
    try {
      const currentRefreshToken = localStorage.getItem('refresh-token')

      if (!currentRefreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await fetch('/api/users/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: currentRefreshToken
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const data = await response.json()

      if (data.token) {
        localStorage.setItem('payload-token', data.token)
        setToken(data.token)
        setIsAuthenticated(true)

        if (data.user) {
          localStorage.setItem('user-data', JSON.stringify(data.user))
        }
      }

      return data
    } catch (error) {
      console.error('Token refresh error:', error)
      logout() // Clear invalid tokens
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
    logout,
    refreshToken
  }
}