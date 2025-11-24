'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations'
import { useToast } from '@/components/ui/use-toast'

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormData) => Promise<void>
  loading?: boolean
  onBackToLogin?: () => void
}

export function ForgotPasswordForm({ onSubmit, loading = false, onBackToLogin }: ForgotPasswordFormProps) {
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const { toast } = useToast()

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await onSubmit(data)
      setSubmittedEmail(data.email)
      setIsEmailSent(true)
      toast({
        title: 'Reset link sent',
        description: 'Check your email for a password reset link.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to send reset link',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
    }
  }

  const handleResetForm = () => {
    setIsEmailSent(false)
    setSubmittedEmail('')
    form.reset()
  }

  if (isEmailSent) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Check your email</h2>
          <p className="text-muted-foreground">
            We've sent a password reset link to<br />
            <span className="font-medium text-white">{submittedEmail}</span>
          </p>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Didn't receive the email? Check your spam folder or<br />
            <button
              onClick={handleResetForm}
              className="text-primary hover:underline font-medium"
              disabled={loading}
            >
              try again with a different email
            </button>
          </p>

          {onBackToLogin && (
            <button
              onClick={onBackToLogin}
              className="flex items-center justify-center mx-auto text-primary hover:underline font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to login
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                                                    <div className="pt-0.3"> </div>

                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter your email"
                      className="pl-10"
                      {...field}
                      type="email"
                      disabled={loading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending reset link...' : 'Send reset link'}
          </Button>
        </form>
      </Form>

      {/* Back to Login */}
      {onBackToLogin && (
        <div className="text-center">
          <button
            onClick={onBackToLogin}
            className="flex items-center justify-center mx-auto text-sm text-primary hover:underline font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to login
          </button>
        </div>
      )}
    </div>
  )
}