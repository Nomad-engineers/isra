import { AuthLayout } from '@/components/layout/auth-layout'

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      {children}
    </AuthLayout>
  )
}