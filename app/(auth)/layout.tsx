import { AuthLayoutWrapper } from '@/components/layout/auth-layout-wrapper'
import { Toaster } from '@/components/ui/toaster'
import { EnhancedAuthGuard } from '@/components/auth/enhanced-auth-guard'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <EnhancedAuthGuard requireAuth={false}>
      <AuthLayoutWrapper>
        {children}
        <Toaster />
      </AuthLayoutWrapper>
    </EnhancedAuthGuard>
  )
}