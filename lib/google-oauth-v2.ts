// Updated Google OAuth implementation using Google Sign-In button approach
// This avoids OAuth2 redirect issues and works better with modern Google APIs

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (notification?: any) => void
          renderButton: (element: HTMLElement, config: any) => void
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
}

export interface GoogleOAuthConfig {
  client_id: string
}

class GoogleOAuthV2 {
  private config: GoogleOAuthConfig | null = null
  private isInitialized = false

  async initialize(config: GoogleOAuthConfig): Promise<void> {
    if (this.isInitialized) return

    this.config = config

    console.log('Initializing Google OAuth v2...')
    console.log('Client ID:', config.client_id)

    // Load Google API script
    await this.loadGoogleScript()

    return new Promise((resolve, reject) => {
      if (window.google) {
        this.isInitialized = true
        resolve()
      } else {
        reject(new Error('Failed to load Google API'))
      }
    })
  }

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

  async signIn(): Promise<{ idToken: string }> {
    if (!this.isInitialized || !this.config) {
      throw new Error('Google OAuth not initialized. Call initialize() first.')
    }

    console.log('Starting Google sign-in...')

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
            1. Add "${window.location.origin}" to Google Cloud Console → Credentials → Authorized JavaScript origins
            2. Make sure you're using http://localhost:3000 or https://your-ngrok-url.com
            3. Wait 5-10 minutes after making changes in Google Cloud Console
            4. Check that the Client ID is correct: ${this.config.client_id}
          `)
        }
      }

      // Use Google Sign-In with prompt
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Google sign-in timed out after 30 seconds'))
        }, 30000)

        // Initialize with callback
        window.google.accounts.id.initialize({
          client_id: this.config!.client_id,
          callback: (response: any) => {
            clearTimeout(timeoutId)

            try {
              console.log('Received Google response:', response)

              if (!response.credential) {
                throw new Error('No credential received from Google')
              }

              // Decode token to get user info
              const payload = this.decodeJWT(response.credential)
              console.log('Decoded user info:', payload)

              const googleUser = {
                id: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                given_name: payload.given_name,
                family_name: payload.family_name,
                idToken: response.credential,
              }

              console.log('Google sign-in successful:', googleUser)
              resolve({ idToken: response.credential })

            } catch (error) {
              console.error('Error processing Google response:', error)
              reject(new Error('Failed to process Google authentication response'))
            }
          },
          auto_select: false,
          cancel_on_tap_outside: false,
        })

        // Show the Google sign-in prompt
        console.log('Showing Google sign-in prompt...')
        window.google.accounts.id.prompt({
          moment_type: 'signIn',
        })

      })

    } catch (error) {
      console.error('Google sign-in error:', error)
      throw error
    }
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
    // Google Sign-In doesn't require explicit sign-out for the flow
    console.log('Google sign-out completed')
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
      currentOrigin: window.location.origin,
      hasGoogleAPI: !!window.google,
      userAgent: navigator.userAgent,
      location: window.location.href
    }
  }
}

// Export singleton instance
export const googleOAuthV2 = new GoogleOAuthV2()