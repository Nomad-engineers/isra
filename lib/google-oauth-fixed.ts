// Google OAuth implementation with automatic domain/port detection
// This version handles common localhost issues

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => Promise<{
              access_token: string
              expires_in: number
              scope: string
              token_type: string
            }>
          }
          initCodeClient: (config: any) => {
            requestCode: () => void
          }
        }
        id: {
          initialize: (config: any) => void
          prompt: () => Promise<{
            getBasicProfile: () => any
            getId: () => string
            getAuthResponse: () => {
              id_token: string
              access_token: string
              expires_in: number
            }
          }>
        }
      }
    }
  }
}

export interface GoogleUser {
  id: string
  email: string
  name: string
  picture: string
  given_name: string
  family_name: string
  idToken: string
  accessToken: string
  expires_in: number
}

export interface GoogleOAuthConfig {
  client_id: string
  redirect_uri?: string
  scope?: string
}

class GoogleOAuthFixed {
  private config: GoogleOAuthConfig | null = null
  private isInitialized = false

  /**
   * Initialize Google OAuth client with automatic domain detection
   */
  async initialize(config: GoogleOAuthConfig): Promise<void> {
    if (this.isInitialized) return

    this.config = {
      client_id: config.client_id,
      redirect_uri: config.redirect_uri || `${this.getCurrentOrigin()}/auth/google-callback`,
      scope: config.scope || 'openid email profile',
    }

    console.log('Initializing Google OAuth with origin:', this.getCurrentOrigin())
    console.log('Client ID:', config.client_id)

    // Load Google API script
    await this.loadGoogleScript()

    return new Promise((resolve, reject) => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: this.config!.client_id,
          callback: (response: any) => {},
          auto_select: false,
        })

        this.isInitialized = true
        resolve()
      } else {
        reject(new Error('Failed to load Google API'))
      }
    })
  }

  /**
   * Get current origin with automatic fallbacks for localhost
   */
  private getCurrentOrigin(): string {
    const origin = window.location.origin

    // Common localhost variations
    const localhostVariations = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ]

    if (localhostVariations.includes(origin)) {
      return origin
    }

    // Return origin with fallback to localhost:3000
    return origin || 'http://localhost:3000'
  }

  /**
   * Load Google API script dynamically
   */
  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector('script[src*="accounts.google.com"]')) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        console.log('Google API script loaded successfully')
        resolve()
      }
      script.onerror = (error) => {
        console.error('Failed to load Google API script:', error)
        reject(new Error('Failed to load Google API script'))
      }

      document.head.appendChild(script)
    })
  }

  /**
   * Sign in with Google using OAuth2 flow (full page redirect)
   */
  async signIn(): Promise<{ idToken: string }> {
    if (!this.config) {
      throw new Error('Google OAuth not configured. Call initialize() first.')
    }

    console.log('Starting Google sign-in with OAuth2 redirect...')

    try {
      // Test Google API availability first
      const testUrl = `https://accounts.google.com/gsi/status?client_id=${this.config.client_id}`

      const statusResponse = await fetch(testUrl).catch(err => {
        console.warn('Google API status check failed:', err)
        return null
      })

      if (statusResponse && !statusResponse.ok) {
        const errorText = await statusResponse.text()
        console.error('Google API status error:', errorText)

        if (statusResponse.status === 403) {
          throw new Error(`
            Google OAuth 403 Error: Origin not authorized

            Solutions:
            1. Add "${this.getCurrentOrigin()}" to Google Cloud Console → Credentials → Authorized JavaScript origins
            2. Make sure you're using http://localhost:3000 (not https)
            3. Wait 5-10 minutes after making changes in Google Cloud Console
            4. Check that the Client ID is correct: ${this.config.client_id}
          `)
        }
      }

      // Generate state and nonce for security
      const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const nonce = Math.random().toString(36).substring(2, 15)

      // Store in sessionStorage for callback validation
      sessionStorage.setItem('googleOAuthState', state)
      sessionStorage.setItem('googleOAuthNonce', nonce)

      // Build OAuth2 URL
      const redirectUri = this.config.redirect_uri || `${this.getCurrentOrigin()}/auth/google-callback`
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(this.config.client_id)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=id_token&` +
        `scope=openid email profile&` +
        `state=${encodeURIComponent(state)}&` +
        `nonce=${encodeURIComponent(nonce)}`

      console.log('Redirecting to Google OAuth...', authUrl)

      // Redirect to Google OAuth
      window.location.href = authUrl

      // Return a promise that will never resolve (since we're redirecting)
      // The callback will be handled on page reload
      return new Promise(() => {})

    } catch (error) {
      console.error('Google sign-in error:', error)
      throw error
    }
  }

  /**
   * Handle Google OAuth callback (call this on page load)
   */
  handleCallback(): { idToken: string } | null {
    // Check if we're returning from Google OAuth
    const urlParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))

    // Check for id_token in URL params or hash
    let idToken = urlParams.get('id_token') || hashParams.get('id_token')

    if (!idToken) {
      // Try to get from Google Identity Services
      const state = sessionStorage.getItem('googleOAuthState')
      if (state && window.google) {
        // Google Identity Services might handle this automatically
        return null
      }
      return null
    }

    // Validate state for security
    const returnedState = urlParams.get('state') || hashParams.get('state')
    const storedState = sessionStorage.getItem('googleOAuthState')

    if (!returnedState || returnedState !== storedState) {
      throw new Error('Invalid OAuth state - possible CSRF attack')
    }

    // Clean up
    sessionStorage.removeItem('googleOAuthState')

    return { idToken }
  }

  /**
   * Decode JWT token to get user information
   */
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Failed to decode Google JWT token:', error)
      throw new Error('Failed to decode Google JWT token')
    }
  }

  /**
   * Sign out from Google
   */
  async signOut(): Promise<void> {
    if (!this.isInitialized) return

    try {
      // Revoke the Google token if needed
      // This is optional as the token will expire naturally
    } catch (error) {
      console.warn('Google sign-out failed:', error)
    }
  }

  /**
   * Check if Google OAuth is ready
   */
  isReady(): boolean {
    return this.isInitialized && window.google !== undefined
  }

  /**
   * Get helpful debug information
   */
  getDebugInfo() {
    return {
      isReady: this.isReady,
      config: this.config,
      currentOrigin: this.getCurrentOrigin(),
      hasGoogleAPI: !!window.google,
      userAgent: navigator.userAgent,
      location: window.location.href
    }
  }
}

// Export singleton instance
export const googleOAuthFixed = new GoogleOAuthFixed()