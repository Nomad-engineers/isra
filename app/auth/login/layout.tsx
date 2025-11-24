import { AuthLayout } from '@/components/layout/auth-layout'

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout
      title="Добро пожаловать"
      subtitle="Войдите в свою учетную запись, чтобы продолжить"
    >
      {children}
    </AuthLayout>
  )
}