import { NextRequest, NextResponse } from 'next/server';
import { TokenManager } from './token-manager';
import { RouteMatcher } from './routes';
import { RateLimiter } from './rate-limiter';
import { AuthError, createErrorRedirect } from './error-handler';

export interface MiddlewareContext {
  pathname: string;
  token: string | null;
  decodedToken: any;
  isAuthPath: boolean;
  isProtectedPath: boolean;
  clientIP: string;
  userAgent: string;
}

export interface AuthResult {
  shouldRedirect: boolean;
  redirectUrl?: string;
  shouldClearToken?: boolean;
}

/**
 * Create middleware context with all necessary data
 */
export function createContext(request: NextRequest): MiddlewareContext {
  const pathname = request.nextUrl.pathname;
  const token = TokenManager.extractToken(request);
  const decodedToken = TokenManager.validateToken(token);

  return {
    pathname,
    token,
    decodedToken,
    isAuthPath: RouteMatcher.isAuthPath(pathname),
    isProtectedPath: RouteMatcher.isProtectedPath(pathname),
    clientIP: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}

/**
 * Handle authentication flow logic
 */
export class AuthMiddleware {
  private static readonly LOGIN_URL = '/auth/login';
  private static readonly ROOMS_URL = '/rooms';

  /**
   * Handle users on authentication pages
   */
  static handleAuthFlow(context: MiddlewareContext, request: NextRequest): AuthResult {
    const { pathname, decodedToken } = context;

    // Authenticated user on auth page → redirect to rooms
    if (context.isAuthPath && decodedToken) {
      return {
        shouldRedirect: true,
        redirectUrl: this.ROOMS_URL,
      };
    }

    return { shouldRedirect: false };
  }

  /**
   * Handle protected route access
   */
  static handleProtectedFlow(
    context: MiddlewareContext,
    request: NextRequest
  ): AuthResult {
    const { pathname, decodedToken } = context;

    // Unauthenticated user on protected page → redirect to login
    if (context.isProtectedPath && !decodedToken) {
      const loginUrl = new URL(this.LOGIN_URL, request.url);
      loginUrl.searchParams.set('redirect', pathname);

      return {
        shouldRedirect: true,
        redirectUrl: loginUrl.toString(),
      };
    }

    return { shouldRedirect: false };
  }

  /**
   * Handle root path redirection
   */
  static handleRootFlow(
    context: MiddlewareContext,
    request: NextRequest
  ): AuthResult {
    const { decodedToken } = context;

    // Root path → redirect based on auth status
    const targetUrl = decodedToken ? this.ROOMS_URL : this.LOGIN_URL;

    return {
      shouldRedirect: true,
      redirectUrl: targetUrl,
    };
  }

  /**
   * Validate token and handle invalid tokens
   */
  static validateToken(
    context: MiddlewareContext,
    request: NextRequest
  ): AuthResult {
    const { token, decodedToken } = context;

    // If token exists but is invalid, clear it
    if (token && !decodedToken) {
      console.warn('Invalid token detected, clearing and redirecting', {
        clientIP: context.clientIP,
        userAgent: context.userAgent,
      });

      return {
        shouldRedirect: true,
        redirectUrl: this.LOGIN_URL,
        shouldClearToken: true,
      };
    }

    return { shouldRedirect: false };
  }

  /**
   * Apply rate limiting for sensitive endpoints
   */
  static applyRateLimiting(
    context: MiddlewareContext,
    request: NextRequest
  ): NextResponse | null {
    const { pathname } = context;

    // Apply stricter rate limiting to auth endpoints
    if (pathname.startsWith('/auth')) {
      if (RateLimiter.isRateLimited(request, 'auth')) {
        const errorResponse = createErrorRedirect(
          request,
          '/auth/login',
          'rate_limited'
        );

        // Add rate limit headers
        const headers = RateLimiter.getRateLimitHeaders(request, 'auth');
        Object.entries(headers).forEach(([key, value]) => {
          errorResponse.headers.set(key, value);
        });

        return errorResponse;
      }
    }

    return null;
  }

  /**
   * Create redirect response
   */
  static createRedirectResponse(
    redirectUrl: string,
    request: NextRequest,
    shouldClearToken: boolean = false
  ): NextResponse {
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));

    // Clear invalid token if requested
    if (shouldClearToken) {
      TokenManager.clearToken(response);
    }

    return response;
  }

  /**
   * Add user context to response headers
   */
  static addUserContextHeaders(
    response: NextResponse,
    context: MiddlewareContext
  ): void {
    const { decodedToken } = context;

    if (decodedToken) {
      // Add user information to headers for downstream usage
      response.headers.set('X-User-ID', decodedToken.userId || decodedToken.sub || '');
      response.headers.set('X-User-Email', decodedToken.email || '');
      response.headers.set('X-Auth-Status', 'authenticated');
      response.headers.set('X-Token-Expires-At', decodedToken.exp?.toString() || '');
    } else {
      response.headers.set('X-Auth-Status', 'unauthenticated');
    }

    // Add rate limit headers (this will be handled in middleware.ts)
  }
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-client-ip') ||
    'unknown'
  );
}

/**
 * Check if request should bypass security checks
 */
export function shouldBypassSecurity(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';

  // Allow known bots and crawlers
  const allowedBots = [
    'googlebot',
    'bingbot',
    'slurp',
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest/0.',
    'developers.google.com/+/web/snippet',
  ];

  return allowedBots.some(bot => userAgent.toLowerCase().includes(bot));
}