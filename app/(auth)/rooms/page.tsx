'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EntityCard } from '@/components/common/entity-card'
import { StatsCard } from '@/components/common/stats-card'
import { PageLoader } from '@/components/ui/loaders'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { formatDate } from '@/lib/utils'
import { mockWebinars, getMockStats } from './mock-data'
import { RefreshCw, Plus, Search, Calendar, Users, FileText, Video, Filter } from 'lucide-react'

export default function RoomsPage() {
  const [webinars] = useState(mockWebinars)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  const stats = getMockStats()

  const filteredWebinars = webinars.filter(webinar =>
    webinar.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    webinar.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  const handleOpen = (id: string) => {
    console.log('Open webinar:', id)
  }

  const handleEdit = (id: string) => {
    console.log('Edit webinar:', id)
  }

  const handleDelete = (id: string) => {
    console.log('Delete webinar:', id)
  }

  const handleCopyLink = async (id: string) => {
    const webinar = webinars.find(w => w.id === id)
    if (webinar) {
      const link = `${window.location.origin}/room/${webinar.id}`
      await navigator.clipboard.writeText(link)
      console.log('Link copied:', link)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Активный', variant: 'default' as const }
      case 'scheduled':
        return { label: 'Запланирован', variant: 'secondary' as const }
      case 'ended':
        return { label: 'Завершен', variant: 'outline' as const }
      case 'draft':
        return { label: 'Черновик', variant: 'outline' as const }
      default:
        return { label: status, variant: 'secondary' as const }
    }
  }

  const getExtraInfo = (webinar: any) => {
    const info = []

    if (webinar.scheduledAt) {
      info.push({
        icon: <Calendar className="h-4 w-4" />,
        label: "Дата",
        value: formatDate(webinar.scheduledAt, 'short')
      })
    }

    if (webinar.currentParticipants !== undefined && webinar.maxParticipants) {
      info.push({
        icon: <Users className="h-4 w-4" />,
        label: "Участники",
        value: `${webinar.currentParticipants}/${webinar.maxParticipants}`
      })
    }

    if (webinar.tags && webinar.tags.length > 0) {
      info.push({
        icon: <FileText className="h-4 w-4" />,
        label: "Теги",
        value: webinar.tags.slice(0, 2).join(', ')
      })
    }

    return info
  }

  if (loading && webinars.length === 0) {
    return <PageLoader />
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Добро пожаловать, Иван! 👋
          </h1>
          <p className='text-muted-foreground'>
            Управляйте своими вебинарами и настройками
          </p>
        </div>

        <div className='flex items-center gap-2 w-full sm:w-auto'>
          <div className='relative flex-1 sm:flex-initial'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Поиск вебинаров...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-8'
            />
          </div>
          <Button variant='outline' size='sm' onClick={handleRefresh}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Обновить
          </Button>
          <Button size='sm'>
            <Plus className='h-4 w-4 mr-2' />
            Создать
          </Button>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Main content */}
        <div className='flex-1'>
          {/* Action buttons */}
          <div className='flex flex-wrap gap-2 mb-6'>
            <Button variant='outline' size='sm'>
              <Filter className='h-4 w-4 mr-2' />
              Фильтр
            </Button>
            <Button variant='outline' size='sm'>
              Импорт
            </Button>
          </div>

          {/* Webinars grid */}
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {filteredWebinars.map((webinar) => (
              <EntityCard
                key={webinar.id}
                data={webinar}
                onView={() => handleOpen(webinar.id)}
                onEdit={() => handleEdit(webinar.id)}
                onDelete={() => handleDelete(webinar.id)}
                onCopyLink={() => handleCopyLink(webinar.id)}
                statusBadge={getStatusBadge(webinar.status)}
                extraInfo={getExtraInfo(webinar)}
              />
            ))}
          </div>

          {filteredWebinars.length === 0 && (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <Video className='h-12 w-12 text-muted-foreground mb-4' />
                <h3 className='text-lg font-medium mb-2'>Вебинары не найдены</h3>
                <p className='text-muted-foreground text-center mb-4'>
                  {searchTerm
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'У вас пока нет вебинаров. Создайте свой первый вебинар!'}
                </p>
                <Button>
                  <Plus className='h-4 w-4 mr-2' />
                  Создать вебинар
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar with stats */}
        <div className='w-full lg:w-80 space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <StatsCard
                title='Всего вебинаров'
                value={stats.total}
                icon={Video}
              />
              <StatsCard
                title='Активных'
                value={stats.active}
                icon={Video}
              />
              <StatsCard
                title='Запланированных'
                value={stats.scheduled}
                icon={Calendar}
              />
              <StatsCard
                title='Черновиков'
                value={stats.drafts}
                icon={FileText}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button className='w-full' size='sm'>
                <Plus className='h-4 w-4 mr-2' />
                Новый вебинар
              </Button>
              <Button variant='outline' className='w-full' size='sm'>
                <Calendar className='h-4 w-4 mr-2' />
                Расписание
              </Button>
              <Button variant='outline' className='w-full' size='sm'>
                <FileText className='h-4 w-4 mr-2' />
                Отчеты
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}