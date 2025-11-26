import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

/**
 * Verify JWT token and return payload
 * Returns null if token is invalid or expired
 */
export function verifyJWTToken(token: string): JWTPayload | null {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    // Remove Bearer prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, '');

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return null;
    }

    const decoded = jwt.verify(cleanToken, jwtSecret) as JWTPayload;

    // Additional expiration check for safety
    if (Date.now() >= decoded.exp * 1000) {
      return null;
    }

    return decoded;
  } catch (error) {
    // Log specific error types for debugging
    if (error instanceof jwt.TokenExpiredError) {
      console.debug('Token expired:', error.message);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.debug('Invalid JWT token:', error.message);
    } else {
      console.error('JWT verification error:', error);
    }
    return null;
  }
}

/**
 * Decode JWT without verification (for debugging only)
 */
export function decodeJWTUnsafe(token: string): any {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}