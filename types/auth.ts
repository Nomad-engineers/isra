export interface User {
  id: string
  email: string
  name?: string
  surname?: string
  phone?: string
  avatar?: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  name: string
  surname: string
  phone?: string
  confirmPassword: string
}

export interface GoogleAuthResponse {
  user: User
  token: string
}

export interface EmailAuthResponse {
  user: User
  token: string
  refreshToken?: string
}

export interface AuthError {
  code: string
  message: string
  field?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: AuthError | null
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  loginWithEmail: (credentials: LoginCredentials) => Promise<void>
  signUpWithEmail: (credentials: SignUpCredentials) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  clearError: () => void
}

export type AuthProvider = 'email' | 'google'

export interface AuthFormData {
  email: string
  password: string
  name?: string
  surname?: string
  phone?: string
  confirmPassword?: string
}