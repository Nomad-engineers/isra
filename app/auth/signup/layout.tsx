import { AuthLayout } from '@/components/layout/auth-layout'
import { EnhancedAuthGuard } from "@/components/auth/enhanced-auth-guard";

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
      <EnhancedAuthGuard requireAuth={false}>
      {children}
      </EnhancedAuthGuard>
    </AuthLayout>
  )
}