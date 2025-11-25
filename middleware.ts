import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that require authentication
const protectedPaths = ['/']
const authPaths = ['/auth/login', '/auth/signup', '/auth/forgot-password']
const publicPaths = ['/api']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') ||
    publicPaths.some(path => pathname.startsWith(path))
  ) {
    return NextResponse.next()
  }

  // Check for JWT token in cookies first (preferred), then fall back to checking header
  const token = getToken(request)

  // Define redirect paths
  const loginUrl = new URL('/auth/login', request.url)
  const roomsUrl = new URL('/rooms', request.url)

  // If user is on auth pages and has token, redirect to rooms
  if (authPaths.some(path => pathname.startsWith(path)) && token) {
    const response = NextResponse.redirect(roomsUrl)
    return response
  }

  // If user is on protected paths and has no token, redirect to login
  if (protectedPaths.some(path => pathname === path) && !token) {
    const response = NextResponse.redirect(loginUrl)
    return response
  }

  // Special handling for root path - this is the main entry point logic
  if (pathname === '/') {
    if (token) {
      // User has token → redirect to /rooms
      const response = NextResponse.redirect(roomsUrl)
      return response
    } else {
      // User has no token → redirect to /auth/login
      const response = NextResponse.redirect(loginUrl)
      return response
    }
  }

  return NextResponse.next()
}

/**
 * Get JWT token from request
 * Priority order:
 * 1. Cookies (preferred - more secure)
 * 2. Custom header from client-side (fallback for localStorage)
 */
function getToken(request: NextRequest): string | null {
  // Check cookies first (preferred method)
  const cookieToken = request.cookies.get('payload-token')?.value
  if (cookieToken) {
    return cookieToken
  }

  // Check custom header as fallback for client-side localStorage
  // This header should be set by client-side code when using localStorage
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Check custom header specifically for localStorage token
  const localStorageToken = request.headers.get('x-local-storage-token')
  if (localStorageToken) {
    return localStorageToken
  }

  return null
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}