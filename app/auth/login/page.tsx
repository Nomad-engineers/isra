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
      // Direct API call instead of using SDK to avoid configuration issues
      const response = await fetch('https://isracms.vercel.app/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.[0]?.message || 'Login failed')
      }

      const result = await response.json()

      // Save token if returned
      if (result.token) {
        localStorage.setItem('payload-token', result.token)
      }

      // Save user data
      if (result.user) {
        localStorage.setItem('payload-user', JSON.stringify(result.user))
      }

      // On successful login, redirect to rooms
      toast.success('Successfully logged in!')
      router.push('/rooms')

    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Неверный email или пароль')
      throw error
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