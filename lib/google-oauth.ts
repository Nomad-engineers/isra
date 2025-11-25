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

class GoogleOAuth {
  private config: GoogleOAuthConfig | null = null
  private isInitialized = false

  /**
   * Initialize Google OAuth client
   */
  async initialize(config: GoogleOAuthConfig): Promise<void> {
    if (this.isInitialized) return

    this.config = {
      client_id: config.client_id,
      redirect_uri: config.redirect_uri || `${window.location.origin}/auth/callback`,
      scope: config.scope || 'openid email profile',
    }

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
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google API script'))

      document.head.appendChild(script)
    })
  }

  /**
   * Sign in with Google using popup/redirect flow
   */
  async signIn(): Promise<GoogleUser> {
    if (!this.isInitialized || !this.config) {
      throw new Error('Google OAuth not initialized. Call initialize() first.')
    }

    try {
      // Use the One Tap flow for better UX
      return new Promise((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: this.config!.client_id,
          callback: (response: any) => {
            // Decode the JWT token to get user info
            const payload = this.decodeJWT(response.credential)
            const googleUser: GoogleUser = {
              id: payload.sub,
              email: payload.email,
              name: payload.name,
              picture: payload.picture,
              given_name: payload.given_name,
              family_name: payload.family_name,
              idToken: response.credential,
              accessToken: '', // We'll get this from token client if needed
              expires_in: 3600, // Default 1 hour
            }
            resolve(googleUser)
          },
          auto_select: false,
        })

        // Show the popup
        window.google.accounts.id.prompt()

        // Fallback timeout in case user cancels
        setTimeout(() => {
          reject(new Error('Google sign-in was cancelled or timed out'))
        }, 30000)
      })
    } catch (error) {
      throw new Error(`Google sign-in failed: ${error}`)
    }
  }

  /**
   * Decode JWT token to get user information
   */
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      return JSON.parse(window.atob(base64))
    } catch (error) {
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
}

// Export singleton instance
export const googleOAuth = new GoogleOAuth()