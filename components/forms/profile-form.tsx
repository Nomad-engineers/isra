'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormPhoneInput } from '@/components/ui/phone-input'
import { ImagePicker } from '@/components/ui/image-picker'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { ProfileFormData, profileFormSchema, ProfileFormDataWithAvatar } from '@/lib/validations'
import { UserProfile } from '@/types/user'

interface ProfileFormProps {
  initialData?: Partial<UserProfile>
  onSubmit: (data: ProfileFormDataWithAvatar) => Promise<void>
  loading?: boolean
}

export function ProfileForm({ initialData, onSubmit, loading = false }: ProfileFormProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      avatar: null,
    },
  })

  const handleSubmit = async (data: ProfileFormData) => {
    const formDataWithAvatar: ProfileFormDataWithAvatar = {
      ...data,
      avatar: selectedAvatar,
    }
    await onSubmit(formDataWithAvatar)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        <ImagePicker
          currentAvatar={initialData?.avatar}
          firstName={initialData?.firstName}
          lastName={initialData?.lastName}
          onImageSelect={setSelectedAvatar}
        />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Имя</FormLabel>
                <FormControl>
                  <Input placeholder='Введите имя' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Фамилия</FormLabel>
                <FormControl>
                  <Input placeholder='Введите фамилию' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type='email' placeholder='Введите email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormPhoneInput
          control={form.control}
          name='phone'
          label='Телефон'
          placeholder='+7(700)-111-2222'
        />

        <Button type='submit' className='w-full' disabled={loading}>
          {loading ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </form>
    </Form>
  )
}