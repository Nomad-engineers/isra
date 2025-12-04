"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { reportsApi } from '@/api/reports'
import { WebinarReport, WebinarReportParams } from '@/api/reports/types'
import { WebinarInfoSection } from './components/webinar-info-section'
import { ViewersSection } from './components/viewers-section'
import { ChatSection } from './components/chat-section'
import { ModeratorsSection } from './components/moderators-section'
import { ReportTabs, ReportIcons } from './components/report-tabs'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function WebinarReportPage() {
  const params = useParams()
  const router = useRouter()
  const webinarId = params.id as string

  const [data, setData] = useState<WebinarReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewersParams, setViewersParams] = useState({
    page: 1,
    limit: 10,
    search: ''
  })
  const [chatParams, setChatParams] = useState({
    page: 1,
    limit: 50
  })

  const fetchData = useCallback(async () => {
    if (!webinarId) return

    try {
      setLoading(true)
      setError(null)

      const requestParams: WebinarReportParams = {
        id: webinarId,
        viewersPage: viewersParams.page,
        viewersLimit: viewersParams.limit,
        viewersSearch: viewersParams.search || undefined,
        chatPage: chatParams.page,
        chatLimit: chatParams.limit
      }

      const response = await reportsApi.getWebinarReport(requestParams)
      setData(response)

    } catch (err) {
      console.error('Webinar report fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch webinar report')
      toast.error('Ошибка загрузки отчета вебинара')
    } finally {
      setLoading(false)
    }
  }, [webinarId, viewersParams, chatParams])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleViewersParamsChange = useCallback((newParams: Partial<typeof viewersParams>) => {
    setViewersParams(prev => ({
      ...prev,
      ...newParams,
      page: newParams.page || (newParams.search ? 1 : prev.page) // Reset to page 1 when searching
    }))
  }, [])

  const handleChatParamsChange = useCallback((newParams: Partial<typeof chatParams>) => {
    setChatParams(prev => ({ ...prev, ...newParams }))
  }, [])

  const handleRefresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Загрузка отчета вебинара...</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-destructive">
            <p className="text-lg font-semibold">Ошибка загрузки</p>
            <p className="text-sm">{error}</p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => router.push('/reports')}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              К списку отчетов
            </Button>
            <Button
              onClick={handleRefresh}
            >
              Повторить попытку
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.push('/reports')}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к отчетам
        </Button>
        <h1 className="text-2xl font-bold">
          Отчет по вебинару: {data.webinar.title}
        </h1>
      </div>

      {/* Report Tabs */}
      <ReportTabs
        tabs={[
          {
            id: 'info',
            label: 'Основная информация',
            icon: ReportIcons.info,
            content: (
              <WebinarInfoSection webinar={data.webinar} />
            )
          },
          {
            id: 'viewers',
            label: 'Зрители',
            icon: ReportIcons.viewers,
            content: (
              <ViewersSection
                viewers={data.viewers}
                params={viewersParams}
                onParamsChange={handleViewersParamsChange}
                loading={loading}
              />
            )
          },
          {
            id: 'chat',
            label: 'Чат',
            icon: ReportIcons.chat,
            content: (
              <ChatSection
                chat={data.chat}
                params={chatParams}
                onParamsChange={handleChatParamsChange}
                loading={loading}
              />
            )
          },
          {
            id: 'moderators',
            label: 'Модераторы',
            icon: ReportIcons.moderators,
            content: (
              <ModeratorsSection
                moderators={data.moderators}
                loading={loading}
              />
            )
          }
        ]}
        defaultTab="info"
      />
    </div>
  )
}