"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ReportData, ReportsParams, ReportStats } from '@/api/reports/types'
import { getStatusColor, getStatusLabel, formatDuration } from '@/lib/report-calculations'
import { format, formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  Users,
  Clock,
  ChevronRight,
  Calendar,
  Video,
  ChevronLeft,
} from 'lucide-react'

interface ReportsTableProps {
  data: ReportData[]
  stats: ReportStats | null
  loading?: boolean
  params: ReportsParams
  onParamsChange: (params: Partial<ReportsParams>) => void
  total: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ReportsTable({
  data,
  stats,
  loading = false,
  params,
  onParamsChange,
  total,
  totalPages,
  onPageChange
}: ReportsTableProps) {
  const router = useRouter()

  const handleViewItem = (item: ReportData) => {
    if (item.type === 'webinar') {
      router.push(`/reports/${item.id}`)
    }
  }

  // Сортировка: последний вебинар сверху
  const sortedData = [...data].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Показать:</span>
          <Select
            value={params.limit?.toString() || '10'}
            onValueChange={(value) => onParamsChange({ limit: parseInt(value) })}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>из {total}</span>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : data.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Нет вебинаров для отображения</p>
            </CardContent>
          </Card>
        ) : (
          sortedData.map((item, index) => {
            const isLatest = index === 0
            const webinarDate = new Date(item.date)
            const isLive = item.status === 'active'
            
            return (
              <Card 
                key={item.id} 
                className={`group cursor-pointer transition-all hover:shadow-md ${
                  isLatest ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                } ${isLive ? 'border-green-500/50' : ''}`}
                onClick={() => handleViewItem(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                      isLive ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      <Video className="h-5 w-5" />
                      {isLive && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        {isLatest && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Последний
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(webinarDate, 'dd MMM yyyy, HH:mm', { locale: ru })}
                        </span>
                        {item.speaker && (
                          <span className="truncate max-w-[150px]">{item.speaker}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-6 shrink-0">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-sm font-semibold">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {item.participants}
                        </div>
                        <div className="text-[10px] text-muted-foreground">зрителей</div>
                      </div>
                      
                      {item.duration && (
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-sm font-semibold">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {formatDuration(item.duration)}
                          </div>
                          <div className="text-[10px] text-muted-foreground">длительность</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Status & Arrow */}
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className={`${getStatusColor(item.status)} text-xs`}>
                        {isLive && <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" />}
                        {getStatusLabel(item.status)}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => params.page && params.page > 1 && onPageChange(params.page - 1)}
            disabled={!params.page || params.page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-muted-foreground px-3">
            Страница {params.page || 1} из {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => params.page && params.page < totalPages && onPageChange(params.page + 1)}
            disabled={!params.page || params.page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
