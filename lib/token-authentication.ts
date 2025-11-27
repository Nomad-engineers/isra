import { NextRequest, NextResponse } from 'next/server'
import { isValidToken, getToken, setToken, clearAuth } from './auth-utils'

/**
 * TokenAuthentication class for centralized authentication management
 * Handles token validation, redirects, and middleware logic
 */
export class TokenAuthentication {
  private static readonly TOKEN_KEY = 'payload-token'
  private static readonly AUTH_PATHS = ['/auth/login', '/auth/signup', '/auth/forgot-password']
  private static readonly PROTECTED_PATHS = ['/', '/rooms', '/profile', '/tariffs']
  private static readonly PUBLIC_PATHS = ['/api']

  /**
   * Check if a path is public (doesn't require authentication)
   */
  private static isPublicPath(pathname: string): boolean {
    return this.PUBLIC_PATHS.some(path => pathname.startsWith(path))
  }

  /**
   * Check if a path is for authentication pages
   */
  private static isAuthPath(pathname: string): boolean {
    return this.AUTH_PATHS.includes(pathname)
  }

  /**
   * Check if a path is protected
   */
  private static isProtectedPath(pathname: string): boolean {
    // Check explicit protected paths
    const explicitProtected = this.PROTECTED_PATHS.some(path => pathname.startsWith(path))
    if (explicitProtected) return true

    // Check if path starts with common protected prefixes
    const protectedPrefixes = ['/rooms', '/profile', '/tariffs']
    return protectedPrefixes.some(prefix => pathname.startsWith(prefix))
  }

  /**
   * Extract token from various sources (cookies, headers, localStorage)
   */
  static extractToken(request: NextRequest): string | null {
    const tokens: Array<{ source: string; token: string | null }> = [
      { source: 'cookie', token: request.cookies.get(this.TOKEN_KEY)?.value ?? null },
      { source: 'authorization', token: request.headers.get('authorization')?.replace('Bearer ', '') ?? null },
      { source: 'custom-header', token: request.headers.get('x-local-storage-token') ?? null }
    ]

    // Return the first valid token from any source
    for (const { source, token } of tokens) {
      if (token && isValidToken(token)) {
        return token
      }
    }

    return null
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(request: NextRequest): boolean {
    const token = this.extractToken(request)
    return !!token
  }

  /**
   * Get the appropriate redirect URL based on authentication status and current path
   */
  static getRedirectUrl(request: NextRequest): string | null {
    const { pathname } = request.nextUrl
    const isAuthenticated = this.isAuthenticated(request)

    // Skip public paths
    if (this.isPublicPath(pathname)) {
      return null
    }

    // Authenticated users on auth pages should be redirected to rooms
    if (isAuthenticated && this.isAuthPath(pathname)) {
      return '/rooms'
    }

    // Skip auth paths for unauthenticated users - they should be accessible
    if (this.isAuthPath(pathname)) {
      return null
    }

    // Unauthenticated users on protected paths should be redirected to login
    if (!isAuthenticated && this.isProtectedPath(pathname)) {
      return '/auth/login'
    }

    // Unauthenticated users on root path should go to login
    if (!isAuthenticated && pathname === '/') {
      return '/auth/login'
    }

    // Authenticated users on root path should go to rooms
    if (isAuthenticated && pathname === '/') {
      return '/rooms'
    }

    return null
  }

  /**
   * Handle authentication logic for middleware
   */
  static handleMiddleware(request: NextRequest): NextResponse | null {
    const redirectUrl = this.getRedirectUrl(request)

    if (redirectUrl) {
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    return null
  }

  /**
   * Client-side authentication check
   * Returns true if token exists and is valid
   */
  static checkClientAuth(): boolean {
    try {
      const token = getToken()
      return token ? isValidToken(token) : false
    } catch (error) {
      console.error('Error checking client authentication:', error)
      return false
    }
  }

  /**
   * Get current authentication status for client-side
   */
  static getClientAuthStatus(): {
    isAuthenticated: boolean
    token: string | null
    error?: string
  } {
    try {
      const token = getToken()
      const isAuthenticated = token ? isValidToken(token) : false

      return {
        isAuthenticated,
        token
      }
    } catch (error) {
      return {
        isAuthenticated: false,
        token: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Handle client-side logout
   */
  static handleLogout(): void {
    try {
      clearAuth()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  /**
   * Set authentication data (client-side)
   */
  static handleLogin(token: string, userData?: any): void {
    try {
      if (isValidToken(token)) {
        setToken(token, userData)
      } else {
        throw new Error('Invalid token provided')
      }
    } catch (error) {
      console.error('Error during login:', error)
      throw error
    }
  }

  /**
   * Create a response with authentication headers
   */
  static createAuthResponse(
    request: NextRequest,
    token: string,
    response?: NextResponse
  ): NextResponse {
    const newResponse = response || NextResponse.next()

    // Add the token as a custom header for client-side access
    newResponse.headers.set('x-auth-token', token)

    return newResponse
  }

  /**
   * Middleware entry point
   */
  static middleware(request: NextRequest): NextResponse {
    // Handle authentication redirects
    const authResponse = this.handleMiddleware(request)
    if (authResponse) {
      return authResponse
    }

    // Continue with the request
    const response = NextResponse.next()

    // Add current token to response headers if authenticated
    const token = this.extractToken(request)
    if (token) {
      return this.createAuthResponse(request, token, response)
    }

    return response
  }
}

// Export a singleton instance for easy usage
export const tokenAuth = TokenAuthentication