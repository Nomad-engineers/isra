import { AuthLayout } from '@/components/layout/auth-layout'

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout
      title="Сбросить пароль"
      subtitle="Введите свой адрес электронной почты, чтобы получить ссылку для сброса пароля"
    >
      {children}
    </AuthLayout>
  )
}