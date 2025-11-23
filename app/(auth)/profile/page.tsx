'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { StatsCard } from '@/components/common/stats-card'
import { ProfileForm } from '@/components/forms/profile-form'
import { ChangePasswordForm } from '@/components/forms/change-password-form'
import { useAsyncOperation } from '@/hooks/use-async-operation'
import { profileApi } from '@/api/profile'
import { User, Lock, CreditCard, BarChart3, Video, FileText, Settings } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan.petrov@example.com',
    phone: '+7 (999) 123-45-67',
    avatar: '',
  })

  const updateProfileOperation = useAsyncOperation(profileApi.updateProfile)
  const changePasswordOperation = useAsyncOperation(profileApi.changePassword)

  const handleProfileUpdate = async (data: any) => {
    await updateProfileOperation.execute(data)
    setProfile(prev => ({ ...prev, ...data }))
  }

  const handlePasswordChange = async (data: any) => {
    await changePasswordOperation.execute(data)
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight text-white'>Профиль</h1>
        <p className='text-gray-400'>Управление вашей учетной записью и настройками</p>
      </div>

      {/* Профиль пользователя */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-white'>
            <User className='h-5 w-5' />
            Профиль пользователя
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initialData={profile}
            onSubmit={handleProfileUpdate}
            loading={updateProfileOperation.loading}
          />
        </CardContent>
      </Card>

      {/* Дополнительные настройки */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-white'>
            <Settings className='h-5 w-5' />
            Дополнительные настройки
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Lock className='h-4 w-4' />
                  Изменить пароль
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Изменение пароля</DialogTitle>
                </DialogHeader>
                <ChangePasswordForm
                  onSubmit={handlePasswordChange}
                  loading={changePasswordOperation.loading}
                />
              </DialogContent>
            </Dialog>

            <Link href="/tariffs">
              <Button variant='outline' className='flex items-center gap-2'>
                <CreditCard className='h-4 w-4' />
                Управление тарифом
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div>
        <h2 className='text-xl font-semibold mb-4 flex items-center gap-2 text-white'>
          <BarChart3 className='h-5 w-5' />
          Статистика
        </h2>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <StatsCard
            title='Всего вебинаров'
            value='24'
            description='За все время'
            icon={Video}
          />
          <StatsCard
            title='Активных'
            value='3'
            description='Сейчас идут'
            icon={Video}
          />
          <StatsCard
            title='Запланированных'
            value='5'
            description='На этой неделе'
            icon={Video}
          />
          <StatsCard
            title='Участников'
            value='1,234'
            description='Всего участников'
            icon={User}
          />
        </div>
      </div>

      {/* Быстрые действия */}
      <Card>
        <CardHeader>
          <CardTitle className='text-white'>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <Link href="/rooms">
              <Button className='w-full flex items-center gap-2 h-auto p-4'>
                <Video className='h-6 w-6' />
                <div className='text-left'>
                  <div className='font-medium'>Мои комнаты</div>
                  <div className='text-sm text-muted-foreground'>Управление вебинарами</div>
                </div>
              </Button>
            </Link>

            <Button variant='outline' className='w-full flex items-center gap-2 h-auto p-4'>
              <FileText className='h-6 w-6' />
              <div className='text-left'>
                <div className='font-medium'>Отчеты</div>
                <div className='text-sm text-muted-foreground'>Аналитика и статистика</div>
              </div>
            </Button>

            <Button variant='outline' className='w-full flex items-center gap-2 h-auto p-4'>
              <Settings className='h-6 w-6' />
              <div className='text-left'>
                <div className='font-medium'>Настройки</div>
                <div className='text-sm text-muted-foreground'>Конфигурация платформы</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Текущий тариф */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between text-white'>
            <div className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              Текущий тариф
            </div>
            <Badge variant='default'>PRO</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Статус</span>
              <span className='font-medium text-white'>Активен</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Следующее списание</span>
              <span className='font-medium text-white'>15 декабря 2024</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Участников на вебинаре</span>
              <span className='font-medium text-white'>До 100</span>
            </div>
            <div className='pt-4'>
              <Link href="/tariffs">
                <Button variant='outline' className='w-full'>
                  Управление тарифом
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}