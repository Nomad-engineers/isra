import { AuthLayoutWrapper } from '@/components/layout/auth-layout-wrapper'
import { Toaster } from '@/components/ui/toaster'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayoutWrapper>
      {children}
      <Toaster />
    </AuthLayoutWrapper>
  )
}