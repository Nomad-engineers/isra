import { NextResponse } from 'next/server'

/**
 * Authentication utilities for JWT token management
 * Supports both localStorage (client-side) and cookies (server-side)
 */

const TOKEN_KEY = 'payload-token'
const USER_KEY = 'payload-user'

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: false, // Allow client-side access
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

/**
 * Set JWT token in both localStorage (client) and cookies (server)
 */
export function setToken(token: string, userData?: any) {
  if (typeof window !== 'undefined') {
    // Client-side: localStorage
    localStorage.setItem(TOKEN_KEY, token)
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
    }
  }
}

/**
 * Get JWT token from cookies or localStorage
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    // Client-side: try localStorage first, then cookies as fallback
    const localStorageToken = localStorage.getItem(TOKEN_KEY)
    if (localStorageToken) {
      return localStorageToken
    }

    // Fallback to cookies if localStorage is empty
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});

    return cookies[TOKEN_KEY] || null
  }

  // Server-side: cookies (handled by middleware)
  return null
}

/**
 * Get user data from localStorage
 */
export function getUser(): any | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }
  return null
}

/**
 * Clear authentication data
 */
export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

/**
 * Set token in server-side response cookies
 */
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS)
  return response
}

/**
 * Clear auth cookies from response
 */
export function clearAuthCookie(response: NextResponse) {
  response.cookies.delete(TOKEN_KEY)
  return response
}

/**
 * Check if token is valid (basic format check)
 */
export function isValidToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false
  }

  // Basic JWT format check: header.payload.signature
  const parts = token.split('.')
  if (parts.length !== 3) {
    return false
  }

  try {
    // Try to decode the payload
    const payload = JSON.parse(atob(parts[1]))

    // Check if token has expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Get token expiration from JWT payload
 */
export function getTokenExpiration(token: string): Date | null {
  if (!isValidToken(token)) {
    return null
  }

  try {
    const parts = token.split('.')
    const payload = JSON.parse(atob(parts[1]))

    if (payload.exp) {
      return new Date(payload.exp * 1000)
    }

    return null
  } catch {
    return null
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token)
  if (!expiration) {
    return false // If no expiration, assume not expired
  }

  return expiration < new Date()
}