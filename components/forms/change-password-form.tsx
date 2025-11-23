'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { ChangePasswordFormData, changePasswordFormSchema } from '@/lib/validations'

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordFormData) => Promise<void>
  loading?: boolean
}

export function ChangePasswordForm({ onSubmit, loading = false }: ChangePasswordFormProps) {
  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='currentPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Текущий пароль</FormLabel>
                                <div className="pt-0.5"> </div>
              <FormControl>
                <Input type='password' placeholder='Введите текущий пароль' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='newPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Новый пароль</FormLabel>
                                <div className="pt-0.5"> </div>

              <FormControl>
                <Input type='password' placeholder='Введите новый пароль' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Подтверждение пароля</FormLabel>
                                <div className="pt-0.5"> </div>

              <FormControl>
                <Input type='password' placeholder='Подтвердите новый пароль' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='w-full' disabled={loading}>
          {loading ? 'Изменение пароля...' : 'Изменить пароль'}
        </Button>
      </form>
    </Form>
  )
}