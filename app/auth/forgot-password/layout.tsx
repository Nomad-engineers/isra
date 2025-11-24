import { AuthLayout } from '@/components/layout/auth-layout'

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email to receive a password reset link"
    >
      {children}
    </AuthLayout>
  )
}