import { AuthLayout } from '@/components/layout/auth-layout'

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Enter your information to get started"
    >
      {children}
    </AuthLayout>
  )
}