/**
 * Configuration constants for middleware
 * Centralizes all middleware settings for better maintainability
 */

export const MiddlewareConfig = {
  // Environment and feature flags
  env: {
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test',
  },

  // Security settings
  security: {
    jwtSecret: process.env.JWT_SECRET,
    enableRateLimiting: process.env.NODE_ENV === 'production',
    enableSecurityHeaders: true,
    enableSuspiciousRequestDetection: process.env.NODE_ENV === 'production',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
  },

  // Authentication settings
  auth: {
    tokenCookieName: 'payload-token',
    loginUrl: '/auth/login',
    roomsUrl: '/rooms',
    defaultRedirectUrl: '/rooms',
    tokenMaxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  },

  // Rate limiting configuration
  rateLimiting: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
    },
    general: {
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests per minute
    },
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 uploads per hour
    },
  },

  // Route configurations
  routes: {
    protected: ['/'],
    auth: ['/auth/login', '/auth/signup', '/auth/forgot-password'],
    public: ['/api', '/_next', '/favicon.ico', '/robots.txt'],
    upload: ['/api/upload', '/api/files'],
  },

  // Cookie settings
  cookies: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },

  // Performance settings
  performance: {
    enableEdgeRuntime: true,
    enableMetrics: process.env.NODE_ENV === 'development',
    enableCacheHeaders: true,
    cacheControlMaxAge: 60 * 60, // 1 hour
  },

  // Logging settings
  logging: {
    enableRequestLogging: process.env.NODE_ENV === 'development',
    enableErrorLogging: true,
    enableSecurityLogging: process.env.NODE_ENV === 'production',
    logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),
  },

  // Known bots that should be allowed through security checks
  allowedBots: [
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
  ],

  // Suspicious patterns that should trigger security alerts
  suspiciousPatterns: [
    /bot/i,
    /crawler/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /go-http/i,
    /node/i,
    /perl/i,
    /ruby/i,
    /php/i,
  ],

  // Static file extensions that should bypass middleware
  staticFileExtensions: [
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif',
    '.css', '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
    '.ico', '.woff', '.woff2', '.ttf', '.eot',
    '.pdf', '.txt', '.xml', '.json', '.rss',
    '.mp4', '.webm', '.ogg', '.mp3', '.wav',
  ],

  // Content Security Policy configuration
  csp: {
    directives: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ],
    reportOnly: process.env.NODE_ENV === 'development',
  },
} as const;

/**
 * Helper function to validate required environment variables
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!MiddlewareConfig.security.jwtSecret) {
    errors.push('JWT_SECRET environment variable is required');
  }

  if (MiddlewareConfig.env.isProduction) {
    if (!process.env.NEXTAUTH_URL) {
      errors.push('NEXTAUTH_URL environment variable is required in production');
    }

    if (MiddlewareConfig.security.allowedOrigins.length === 0) {
      errors.push('ALLOWED_ORIGINS environment variable is required in production');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get configuration for specific rate limit type
 */
export function getRateLimitConfig(type: keyof typeof MiddlewareConfig.rateLimiting) {
  return MiddlewareConfig.rateLimiting[type];
}

/**
 * Check if a path matches a specific route type
 */
export function isPathType(pathname: string, type: keyof typeof MiddlewareConfig.routes): boolean {
  const paths = MiddlewareConfig.routes[type];

  return paths.some(path => {
    if (path.endsWith('/')) {
      return pathname.startsWith(path);
    }
    return pathname === path;
  });
}