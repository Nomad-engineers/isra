/**
 * Optimized route matching for better performance
 * Uses Sets for O(1) lookups instead of array.some() which is O(n)
 */

export class RouteMatcher {
  // Core paths
  private static readonly PROTECTED_PATHS = new Set(['/']);
  private static readonly AUTH_PATHS = new Set([
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password'
  ]);

  // Public paths that bypass middleware
  private static readonly PUBLIC_PATH_PREFIXES = new Set([
    '/api',
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml'
  ]);

  // Static file extensions
  private static readonly STATIC_FILE_EXTENSIONS = new Set([
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif',
    '.css', '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
    '.ico', '.woff', '.woff2', '.ttf', '.eot',
    '.pdf', '.txt', '.xml', '.json', '.rss'
  ]);

  /**
   * Check if path is an authentication path
   */
  static isAuthPath(pathname: string): boolean {
    // Direct match first (faster)
    if (this.AUTH_PATHS.has(pathname)) {
      return true;
    }

    // Then check prefixes
    for (const path of this.AUTH_PATHS) {
      if (pathname.startsWith(path + '/')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if path is a protected path
   */
  static isProtectedPath(pathname: string): boolean {
    return this.PROTECTED_PATHS.has(pathname);
  }

  /**
   * Check if path should bypass middleware
   */
  static isPublicPath(pathname: string): boolean {
    // Check prefixes first
    for (const prefix of this.PUBLIC_PATH_PREFIXES) {
      if (pathname.startsWith(prefix)) {
        return true;
      }
    }

    // Check if it's a static file
    const extension = this.getFileExtension(pathname);
    if (extension && this.STATIC_FILE_EXTENSIONS.has(extension)) {
      return true;
    }

    return false;
  }

  /**
   * Check if path is an API route
   */
  static isAPIPath(pathname: string): boolean {
    return pathname.startsWith('/api/');
  }

  /**
   * Get file extension from pathname
   */
  private static getFileExtension(pathname: string): string | null {
    const lastDot = pathname.lastIndexOf('.');
    if (lastDot === -1 || lastDot === pathname.length - 1) {
      return null;
    }

    return pathname.slice(lastDot).toLowerCase();
  }

  /**
   * Normalize pathname for consistent matching
   */
  static normalizePath(pathname: string): string {
    // Remove trailing slashes except for root
    return pathname === '/' ? pathname : pathname.replace(/\/+$/, '');
  }

  /**
   * Check if path should be skipped by middleware
   */
  static shouldSkipMiddleware(pathname: string): boolean {
    const normalized = this.normalizePath(pathname);

    return (
      this.isPublicPath(normalized) ||
      this.isAPIPath(normalized) ||
      normalized.startsWith('/_next/') ||
      normalized.includes('.') // Has file extension
    );
  }
}