import { NextRequest } from 'next/server';

interface RateLimitData {
  count: number;
  resetTime: number;
  lastAccess: number;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// In-memory storage for rate limiting
const rateLimitMap = new Map<string, RateLimitData>();

export class RateLimiter {
  static readonly LIMITS: Record<string, RateLimitConfig> = {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      skipSuccessfulRequests: false,
    },
    general: {
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests per minute
    },
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 uploads per hour
    },
  };

  /**
   * Check if request is rate limited
   */
  static isRateLimited(
    request: NextRequest,
    type: keyof typeof RateLimiter.LIMITS = 'general',
    identifier?: string
  ): boolean {
    const config = this.LIMITS[type];
    const clientIdentifier = identifier || this.getClientIdentifier(request);
    const now = Date.now();

    let data = rateLimitMap.get(clientIdentifier);

    // Initialize or clean up expired data
    if (!data || now > data.resetTime) {
      data = {
        count: 0,
        resetTime: now + config.windowMs,
        lastAccess: now,
      };
      rateLimitMap.set(clientIdentifier, data);
    }

    // Increment counter
    data.count++;
    data.lastAccess = now;

    // Check if limit exceeded
    const isLimited = data.count > config.max;

    if (isLimited) {
      console.warn('Rate limit exceeded', {
        identifier: clientIdentifier,
        type,
        count: data.count,
        limit: config.max,
        window: config.windowMs,
        resetTime: new Date(data.resetTime).toISOString(),
      });
    }

    return isLimited;
  }

  /**
   * Get remaining requests for client
   */
  static getRemainingRequests(
    request: NextRequest,
    type: keyof typeof RateLimiter.LIMITS = 'general',
    identifier?: string
  ): number {
    const config = this.LIMITS[type];
    const clientIdentifier = identifier || this.getClientIdentifier(request);
    const data = rateLimitMap.get(clientIdentifier);

    if (!data || Date.now() > data.resetTime) {
      return config.max;
    }

    return Math.max(0, config.max - data.count);
  }

  /**
   * Get time until reset (in seconds)
   */
  static getResetTime(
    request: NextRequest,
    type: keyof typeof RateLimiter.LIMITS = 'general',
    identifier?: string
  ): number {
    const config = this.LIMITS[type];
    const clientIdentifier = identifier || this.getClientIdentifier(request);
    const data = rateLimitMap.get(clientIdentifier);

    if (!data) {
      return 0;
    }

    const resetInSeconds = Math.ceil((data.resetTime - Date.now()) / 1000);
    return Math.max(0, resetInSeconds);
  }

  /**
   * Reset rate limit for a specific identifier
   */
  static resetLimit(identifier: string): void {
    rateLimitMap.delete(identifier);
  }

  /**
   * Clean up expired entries
   */
  static cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.debug(`Cleaned up ${cleaned} expired rate limit entries`);
    }
  }

  /**
   * Get rate limit status for headers
   */
  static getRateLimitHeaders(
    request: NextRequest,
    type: keyof typeof RateLimiter.LIMITS = 'general',
    identifier?: string
  ): Record<string, string> {
    const config = this.LIMITS[type];
    const remaining = this.getRemainingRequests(request, type, identifier);
    const reset = this.getResetTime(request, type, identifier);

    return {
      'X-RateLimit-Limit': config.max.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    };
  }

  /**
   * Get client identifier for rate limiting
   */
  private static getClientIdentifier(request: NextRequest): string {
    // Try different headers in order of preference
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      // Use the first IP in the chain
      return forwardedFor.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    const clientIP = request.headers.get('x-client-ip');
    if (clientIP) {
      return clientIP;
    }

    // Fallback to a hash of user agent (less ideal but better than nothing)
    const userAgent = request.headers.get('user-agent') || 'unknown';
    try {
      const hash = Buffer.from(userAgent).toString('base64').substring(0, 16);
      return `hash_${hash}`;
    } catch {
      return `fallback_${Date.now()}`;
    }
  }

  /**
   * Get rate limit statistics
   */
  static getStats(): {
    totalEntries: number;
    activeEntries: number;
    entriesByType: Record<string, number>;
  } {
    const now = Date.now();
    let activeEntries = 0;
    const entriesByType: Record<string, number> = {};

    for (const [key, data] of rateLimitMap.entries()) {
      if (now <= data.resetTime) {
        activeEntries++;

        // Count by type (based on key prefix if available)
        const type = key.includes('auth') ? 'auth' :
                    key.includes('upload') ? 'upload' : 'general';
        entriesByType[type] = (entriesByType[type] || 0) + 1;
      }
    }

    return {
      totalEntries: rateLimitMap.size,
      activeEntries,
      entriesByType,
    };
  }
}

// Auto-cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    RateLimiter.cleanup();
  }, 5 * 60 * 1000);
}