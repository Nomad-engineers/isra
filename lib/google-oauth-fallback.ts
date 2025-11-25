// Alternative Google OAuth implementation using older API
// Use this if the newer Google Identity Services API fails

declare global {
  interface Window {
    gapi: {
      auth2: {
        getAuthInstance: () => Promise<{
          signIn: () => Promise<any>
          signOut: () => Promise<void>
          currentUser: {
            get: () => {
              getBasicProfile: () => {
                getName: () => string
                getEmail: () => string
                getImageUrl: () => string
                getGivenName: () => string
                getFamilyName: () => string
              }
              getId: () => string
              getAuthResponse: () => {
                id_token: string
                access_token: string
                expires_in: number
              }
            }
          }
        }>
        init: (config: any) => Promise<void>
      }
      load: (modules: string, callback?: () => void) => void
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
}

class GoogleOAuthFallback {
  private config: GoogleOAuthConfig | null = null
  private isInitialized = false

  async initialize(config: GoogleOAuthConfig): Promise<void> {
    if (this.isInitialized) return

    this.config = config

    // Load Google API script
    await this.loadGoogleScript()

    return new Promise((resolve, reject) => {
      if (window.gapi) {
        window.gapi.load('auth2', async () => {
          try {
            await window.gapi.auth2.init({
              client_id: this.config!.client_id,
              scope: 'openid email profile',
            })

            this.isInitialized = true
            resolve()
          } catch (error) {
            reject(error)
          }
        })
      } else {
        reject(new Error('Failed to load Google API'))
      }
    })
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector('script[src*="apis.google.com"]')) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/platform.js'
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google API script'))

      document.head.appendChild(script)
    })
  }

  async signIn(): Promise<GoogleUser> {
    if (!this.isInitialized || !this.config) {
      throw new Error('Google OAuth not initialized. Call initialize() first.')
    }

    try {
      const authInstance = await window.gapi.auth2.getAuthInstance()
      const googleUser = await authInstance.signIn()

      const profile = googleUser.getBasicProfile()
      const authResponse = googleUser.getAuthResponse()

      return {
        id: profile.getId(),
        email: profile.getEmail(),
        name: profile.getName(),
        picture: profile.getImageUrl(),
        given_name: profile.getGivenName(),
        family_name: profile.getFamilyName(),
        idToken: authResponse.id_token,
        accessToken: authResponse.access_token,
        expires_in: authResponse.expires_in,
      }
    } catch (error) {
      throw new Error(`Google sign-in failed: ${error}`)
    }
  }

  async signOut(): Promise<void> {
    if (!this.isInitialized) return

    try {
      const authInstance = await window.gapi.auth2.getAuthInstance()
      await authInstance.signOut()
    } catch (error) {
      console.warn('Google sign-out failed:', error)
    }
  }

  isReady(): boolean {
    return this.isInitialized && window.gapi?.auth2 !== undefined
  }
}

// Export singleton instance
export const googleOAuthFallback = new GoogleOAuthFallback()