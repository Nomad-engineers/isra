"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { reportsApi } from '@/api/reports'
import { WebinarReport, WebinarReportParams, ChartFilter } from '@/api/reports/types'
import { WebinarInfoSection } from './components/webinar-info-section'
import { ViewersSection } from './components/viewers-section'
import { UniqueViewersSection } from './components/unique-viewers-section'
import { ViewersChart } from './components/viewers-chart'
import { ChatSection } from './components/chat-section'
import { ModeratorsSection } from './components/moderators-section'
import { ReportTabs, ReportIcons } from './components/report-tabs'
import { ExportButtons } from './components/export-buttons'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, RefreshCw, Calendar, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function WebinarReportPage() {
  const params = useParams()
  const router = useRouter()
  const webinarId = params.id as string

  const [data, setData] = useState<WebinarReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportDuration, setReportDuration] = useState<'full' | '4h' | '5h' | '6h'>('4h')
  
  const [viewersParams, setViewersParams] = useState({
    page: 1,
    limit: 50,
    search: ''
  })
  const [uniqueViewersParams, setUniqueViewersParams] = useState({
    page: 1,
    limit: 50,
    search: ''
  })
  const [chatParams, setChatParams] = useState({
    page: 1,
    limit: 50
  })
  const [chartFilter, setChartFilter] = useState<ChartFilter>({
    device: 'all',
    utmFilter: [],
    granularity: 'optimal'
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
        uniqueViewersPage: uniqueViewersParams.page,
        uniqueViewersLimit: uniqueViewersParams.limit,
        uniqueViewersSearch: uniqueViewersParams.search || undefined,
        chatPage: chatParams.page,
        chatLimit: chatParams.limit,
        chartFilter: chartFilter
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
  }, [webinarId, viewersParams, uniqueViewersParams, chatParams, chartFilter])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleViewersParamsChange = useCallback((newParams: Partial<typeof viewersParams>) => {
    setViewersParams(prev => ({
      ...prev,
      ...newParams,
      page: newParams.page || (newParams.search !== undefined ? 1 : prev.page)
    }))
  }, [])

  const handleUniqueViewersParamsChange = useCallback((newParams: Partial<typeof uniqueViewersParams>) => {
    setUniqueViewersParams(prev => ({
      ...prev,
      ...newParams,
      page: newParams.page || (newParams.search !== undefined ? 1 : prev.page)
    }))
  }, [])

  const handleChatParamsChange = useCallback((newParams: Partial<typeof chatParams>) => {
    setChatParams(prev => ({ ...prev, ...newParams }))
  }, [])

  const handleChartFilterChange = useCallback((filter: ChartFilter) => {
    setChartFilter(filter)
  }, [])

  const handleRefresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  // Get counts for badges
  const viewersCount = data?.viewers?.total || 164
  const uniqueViewersCount = data?.uniqueViewers?.total || 164
  const chatCount = data?.chat?.totalMessages || 847
  const moderatorsCount = data?.moderators?.length || 2

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <p className="font-semibold text-lg">Загрузка отчета</p>
            <p className="text-muted-foreground text-sm">Собираем данные вебинара...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">😔</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-destructive">Ошибка загрузки</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <Button
                onClick={() => router.push('/reports')}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                К списку
              </Button>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Повторить
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/reports')}
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold line-clamp-1">
                Отчет: {data.webinar.title}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {viewersCount} зрителей
                </span>
              </div>
            </div>
          </div>
          
          {/* Header Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Report Duration Selector */}
            <Select value={reportDuration} onValueChange={(v: any) => setReportDuration(v)}>
              <SelectTrigger className="w-[160px] h-9">
                <Clock className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Целиком</SelectItem>
                <SelectItem value="4h">Первые 4 часа</SelectItem>
                <SelectItem value="5h">Первые 5 часов</SelectItem>
                <SelectItem value="6h">Первые 6 часов</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Export Buttons */}
            <ExportButtons
              webinarId={webinarId}
              webinarTitle={data.webinar.title}
            />
            
            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </div>

        {/* Report Tabs - 6 tabs like bizon365 */}
        <ReportTabs
          tabs={[
            {
              id: 'info',
              label: 'Сведения',
              icon: ReportIcons.info,
              content: (
                <WebinarInfoSection
                  webinar={data.webinar}
                  engagement={data.engagement}
                  conversions={data.conversions}
                  totalViewers={viewersCount}
                />
              )
            },
            {
              id: 'viewers',
              label: 'Зрители',
              icon: ReportIcons.viewers,
              badge: viewersCount,
              badgeColor: 'default',
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
              id: 'unique-viewers',
              label: 'Уникальные зрители',
              icon: ReportIcons.uniqueViewers,
              badge: uniqueViewersCount,
              badgeColor: 'success',
              content: (
                <UniqueViewersSection
                  viewers={data.uniqueViewers}
                  deviceStats={data.deviceStats}
                  geoStats={data.geoStats}
                  params={uniqueViewersParams}
                  onParamsChange={handleUniqueViewersParamsChange}
                  loading={loading}
                />
              )
            },
            {
              id: 'chart',
              label: 'График',
              icon: ReportIcons.chart,
              content: (
                <ViewersChart
                  data={data.chartData || []}
                  retentionAnalytics={data.retentionAnalytics}
                  peakViewers={data.engagement?.peakViewers || 164}
                  peakTime={data.engagement?.peakTime || '19:45'}
                  webinarDuration={data.webinar?.duration ? Math.floor(data.webinar.duration / 60000) : 120}
                  onFilterChange={handleChartFilterChange}
                  loading={loading}
                />
              )
            },
            {
              id: 'chat',
              label: 'Чат',
              icon: ReportIcons.chat,
              badge: chatCount,
              badgeColor: 'default',
              content: (
                <ChatSection
                  chat={data.chat?.messages || []}
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
              badge: moderatorsCount,
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
    </div>
  )
}