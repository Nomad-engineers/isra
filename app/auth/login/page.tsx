'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/forms/login-form'
import { LoginFormData } from '@/lib/validations'
import { toast } from 'sonner'
import { sdk } from '@/lib/sdk'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const handleEmailLogin = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const result = await sdk.login({
        collection: 'users',
        data: {
          email: data.email,
          password: data.password,
        },
      })

      // Save token if returned
      if (result.token) {
        localStorage.setItem('payload-token', result.token)
      }

      // On successful login, redirect to rooms
      toast.success('Successfully logged in!')
      router.push('/rooms')

    } catch (error) {
      console.error('Login error:', error)
      toast.error('Неверный email или пароль')
      throw new Error('Неверный email или пароль')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)

    try {
      // TODO: Implement Google OAuth
      console.log('Login with Google')

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // On successful login, redirect to dashboard or intended page
      toast.success('Successfully logged in with Google!')
      router.push('/profile')

    } catch (error) {
      console.error('Google login error:', error)
      throw error
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <LoginForm
      onSubmit={handleEmailLogin}
      onGoogleSignIn={handleGoogleLogin}
      loading={isLoading}
      googleLoading={isGoogleLoading}
    />
  )
}