import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ReportsParams, ReportData } from '@/api/reports/types'
import { ExportDialog } from './export-dialog'
import {
  Search,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Users,
  Activity,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

interface ReportsHeaderProps {
  params: ReportsParams
  onParamsChange: (params: Partial<ReportsParams>) => void
  onRefresh: () => void
  loading?: boolean
  autoRefreshEnabled: boolean
  onAutoRefreshToggle: (enabled: boolean) => void
  data: ReportData[]
}

export function ReportsHeader({
  params,
  onParamsChange,
  onRefresh,
  loading = false,
  autoRefreshEnabled,
  onAutoRefreshToggle,
  data
}: ReportsHeaderProps) {
  const [isExportOpen, setIsExportOpen] = useState(false)

  const handleSearch = (value: string) => {
    onParamsChange({ search: value })
  }

  const handleDataTypeChange = (value: string) => {
    onParamsChange({ dataType: value as 'webinars' | 'users' | 'both' })
  }

  const handleStatusChange = (value: string) => {
    onParamsChange({ status: value || undefined })
  }

  return (
    <div className="space-y-4">
      {/* Page Title and Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Отчеты
          </h1>
          <p className="text-gray-400">
            Аналитика и статистика вебинаров и пользователей
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-refresh Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAutoRefreshToggle(!autoRefreshEnabled)}
            className="flex items-center gap-2"
          >
            {autoRefreshEnabled ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            Автообновление
            {autoRefreshEnabled && (
              <Badge variant="secondary" className="text-xs">
                30 сек
              </Badge>
            )}
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>

          {/* Export Button */}
          <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={data.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Экспорт отчетов</DialogTitle>
              </DialogHeader>
              <ExportDialog
                params={params}
                onClose={() => setIsExportOpen(false)}
                data={data}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию, спикеру или описанию..."
            value={params.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Data Type Filter */}
        <Select
          value={params.dataType || 'both'}
          onValueChange={handleDataTypeChange}
        >
          <SelectTrigger className="w-full lg:w-48">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <SelectValue placeholder="Тип данных" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">Все данные</SelectItem>
            <SelectItem value="webinars">Вебинары</SelectItem>
            <SelectItem value="users">Пользователи</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={params.status || ''}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full lg:w-48">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Статус" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="completed">Завершенные</SelectItem>
            <SelectItem value="scheduled">Запланированные</SelectItem>
            <SelectItem value="cancelled">Отмененные</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {params.dateFrom && params.dateTo
              ? `${new Date(params.dateFrom).toLocaleDateString('ru-RU')} - ${new Date(params.dateTo).toLocaleDateString('ru-RU')}`
              : 'Весь период'
            }
          </span>
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="flex flex-wrap gap-2">
        {params.search && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Поиск: {params.search}
            <button
              onClick={() => onParamsChange({ search: undefined })}
              className="ml-1 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </Badge>
        )}

        {params.dataType && params.dataType !== 'both' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Тип: {params.dataType === 'webinars' ? 'Вебинары' : 'Пользователи'}
            <button
              onClick={() => onParamsChange({ dataType: 'both' })}
              className="ml-1 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </Badge>
        )}

        {params.status && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Статус: {getStatusLabel(params.status)}
            <button
              onClick={() => onParamsChange({ status: undefined })}
              className="ml-1 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </Badge>
        )}

        {(params.dateFrom || params.dateTo) && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Период: {params.dateFrom ? new Date(params.dateFrom).toLocaleDateString('ru-RU') : '...'} - {params.dateTo ? new Date(params.dateTo).toLocaleDateString('ru-RU') : '...'}
            <button
              onClick={() => onParamsChange({ dateFrom: undefined, dateTo: undefined })}
              className="ml-1 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </Badge>
        )}
      </div>
    </div>
  )
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Активные',
    completed: 'Завершенные',
    scheduled: 'Запланированные',
    cancelled: 'Отмененные'
  }
  return labels[status] || status
}