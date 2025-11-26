import { NextRequest, NextResponse } from 'next/server';
import { RouteMatcher } from './lib/routes';
import { TokenManager } from './lib/token-manager';
import { AuthMiddleware, createContext, shouldBypassSecurity } from './lib/proxy-helpers';
import { RateLimiter } from './lib/rate-limiter';
import { handleError, addSecurityHeaders, SecurityError } from './lib/error-handler';


/**
 * Enhanced middleware with security, performance, and maintainability improvements
 */
export function proxy(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { pathname } = request.nextUrl;

    // Skip middleware for static files and Next.js internals
    if (RouteMatcher.shouldSkipMiddleware(pathname)) {
      return addSecurityHeaders(NextResponse.next());
    }

    // Create context with all necessary data
    const context = createContext(request);

    // Apply rate limiting for sensitive endpoints
    const rateLimitResponse = AuthMiddleware.applyRateLimiting(context, request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Security checks (skip for known bots)
    if (!shouldBypassSecurity(request)) {
      // Validate token format and presence
      const tokenValidation = AuthMiddleware.validateToken(context, request);
      if (tokenValidation.shouldRedirect) {
        const response = AuthMiddleware.createRedirectResponse(
          tokenValidation.redirectUrl!,
          request,
          tokenValidation.shouldClearToken
        );
        return addSecurityHeaders(response);
      }

      // Check for suspicious requests
      if (isSuspiciousRequest(request, context)) {
        throw new SecurityError('Suspicious request detected', 'SUSPICIOUS_REQUEST');
      }
    }

    // Handle authentication flow (authenticated users on auth pages)
    const authResult = AuthMiddleware.handleAuthFlow(context, request);
    if (authResult.shouldRedirect) {
      const response = AuthMiddleware.createRedirectResponse(
        authResult.redirectUrl!,
        request
      );
      return addSecurityHeaders(response);
    }

    // Handle protected route access
    const protectedResult = AuthMiddleware.handleProtectedFlow(context, request);
    if (protectedResult.shouldRedirect) {
      const response = AuthMiddleware.createRedirectResponse(
        protectedResult.redirectUrl!,
        request
      );
      return addSecurityHeaders(response);
    }

    // Handle root path redirection
    if (pathname === '/') {
      const rootResult = AuthMiddleware.handleRootFlow(context, request);
      if (rootResult.shouldRedirect) {
        const response = AuthMiddleware.createRedirectResponse(
          rootResult.redirectUrl!,
          request,
          rootResult.shouldClearToken
        );
        return addSecurityHeaders(response);
      }
    }

    // Continue with normal request processing
    const response = NextResponse.next();

    // Add user context to response headers
    AuthMiddleware.addUserContextHeaders(response, context);

    // Add performance and security headers
    addSecurityHeaders(response);
    response.headers.set('X-Process-Time', String(Date.now() - startTime));
    response.headers.set('X-Middleware-Version', '2.0.0');

    return response;

  } catch (error) {
    return handleError(error, request);
  }
}

/**
 * Detect suspicious requests for enhanced security
 */
function isSuspiciousRequest(request: NextRequest, context: any): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer');
  const origin = request.headers.get('origin');

  // Check for missing user agent (except for health checks)
  if (!userAgent && !request.nextUrl.pathname.includes('/health')) {
    return true;
  }

  // Check for suspicious patterns in user agent
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /go-http/i,
  ];

  // Allow known bots, block others for auth routes
  if (request.nextUrl.pathname.startsWith('/auth')) {
    const isKnownBot = userAgent.toLowerCase().includes('googlebot') ||
                      userAgent.toLowerCase().includes('bingbot') ||
                      userAgent.toLowerCase().includes('facebookexternalhit');

    if (suspiciousPatterns.some(pattern => pattern.test(userAgent)) && !isKnownBot) {
      return true;
    }
  }

  // Check for missing referer on POST requests (potential CSRF)
  if (request.method === 'POST' && !referer && !origin) {
    const suspiciousPaths = ['/auth/', '/api/', '/admin/'];
    if (suspiciousPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
      return true;
    }
  }

  // Check for unusual request size
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB
    // Only allow large uploads to specific endpoints
    const allowedUploadPaths = ['/api/upload', '/api/files'];
    if (!allowedUploadPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
      return true;
    }
  }

  return false;
}

/**
 * Middleware configuration with optimized matcher
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - handled separately
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - files with extensions (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};