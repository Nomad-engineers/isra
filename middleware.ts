import { NextRequest } from 'next/server'
import { TokenAuthentication } from '@/lib/token-authentication'

/**
 * Middleware for authentication using TokenAuthentication class
 * Handles token validation and redirects based on authentication status
 */
export function middleware(request: NextRequest) {
  return TokenAuthentication.middleware(request)
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