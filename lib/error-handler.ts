import { NextRequest, NextResponse } from 'next/server';

export class MiddlewareError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public category: 'auth' | 'rate_limit' | 'security' | 'system' = 'system'
  ) {
    super(message);
    this.name = 'MiddlewareError';
  }
}

export class AuthError extends MiddlewareError {
  constructor(message: string, code?: string) {
    super(message, 401, code, 'auth');
  }
}

export class RateLimitError extends MiddlewareError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMITED', 'rate_limit');
  }
}

export class SecurityError extends MiddlewareError {
  constructor(message: string, code?: string) {
    super(message, 403, code, 'security');
  }
}

/**
 * Comprehensive error handling for middleware
 */
export function handleError(error: unknown, request: NextRequest): NextResponse {
  const timestamp = new Date().toISOString();
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = getClientIP(request);

  // Log error details
  console.error('Middleware Error:', {
    timestamp,
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    url,
    userAgent,
    ip,
    type: error instanceof MiddlewareError ? error.category : 'unknown',
  });

  // Handle known middleware errors
  if (error instanceof MiddlewareError) {
    const response = NextResponse.json(
      {
        error: error.message,
        code: error.code,
        timestamp,
        requestId: generateRequestId(),
      },
      {
        status: error.statusCode,
        headers: {
          'X-Error-Category': error.category,
          'X-Request-ID': generateRequestId(),
        }
      }
    );

    // Add security headers even for error responses
    addSecurityHeaders(response);
    return response;
  }

  // Handle unknown errors
  const response = NextResponse.json(
    {
      error: 'Internal Server Error',
      timestamp,
      requestId: generateRequestId(),
    },
    {
      status: 500,
      headers: {
        'X-Error-Category': 'system',
        'X-Request-ID': generateRequestId(),
      }
    }
  );

  addSecurityHeaders(response);
  return response;
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
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  const headers = {
    // Security headers
    'X-DNS-Prefetch-Control': 'on',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
    'Permissions-Policy': 'geolocation=()',

    // HSTS (only in production)
    ...(process.env.NODE_ENV === 'production' && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    }),

    // Content security policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),

    // CORS headers
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? '*' : 'self',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  };

  Object.entries(headers).forEach(([key, value]) => {
    if (value !== undefined) {
      response.headers.set(key, value);
    }
  });

  return response;
}

/**
 * Create error response with redirect
 */
export function createErrorRedirect(
  request: NextRequest,
  destination: string,
  errorType?: string
): NextResponse {
  const url = new URL(destination, request.url);

  if (errorType) {
    url.searchParams.set('error', errorType);
  }

  const response = NextResponse.redirect(url);
  addSecurityHeaders(response);

  return response;
}