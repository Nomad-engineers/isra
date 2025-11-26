import { NextRequest, NextResponse } from 'next/server';
import { verifyJWTToken } from './jwt';

export const COOKIE_CONFIG = {
  name: 'payload-token',
  options: {
    httpOnly: true,          // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const, // CSRF protection
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  }
};

export class TokenManager {
  private static readonly COOKIE_NAME = COOKIE_CONFIG.name;

  /**
   * Extract token from request with priority order
   * 1. Secure cookie (preferred method)
   * 2. Authorization header
   * 3. Custom header (localStorage fallback)
   */
  static extractToken(request: NextRequest): string | null {
    // Priority 1: Secure cookie (most secure)
    const cookieToken = request.cookies.get(this.COOKIE_NAME)?.value;
    if (cookieToken) {
      return cookieToken;
    }

    // Priority 2: Authorization header (Bearer token)
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token) return token;
    }

    // Priority 3: Custom header for localStorage fallback
    const customHeader = request.headers.get('x-local-storage-token');
    if (customHeader?.trim()) {
      return customHeader.trim();
    }

    return null;
  }

  /**
   * Validate and decode token
   */
  static validateToken(token: string | null): ReturnType<typeof verifyJWTToken> {
    if (!token) return null;
    return verifyJWTToken(token);
  }

  /**
   * Set secure cookie with token
   */
  static setSecureCookie(response: NextResponse, token: string): void {
    response.cookies.set({
      name: this.COOKIE_NAME,
      value: token,
      ...COOKIE_CONFIG.options,
    });
  }

  /**
   * Clear token from cookies
   */
  static clearToken(response: NextResponse): void {
    response.cookies.delete(this.COOKIE_NAME);
  }

  /**
   * Check if request is from same origin (for security)
   */
  static isSameOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    const referer = request.headers.get('referer');

    // Allow same-origin requests
    if (origin && origin.includes(host || '')) {
      return true;
    }

    // Allow requests from same domain
    if (referer && referer.includes(host || '')) {
      return true;
    }

    return false;
  }
}