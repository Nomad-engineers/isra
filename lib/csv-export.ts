import Papa from 'papaparse'
import { format } from 'date-fns'
import { ReportData, ExportOptions } from '@/api/reports/types'

export function exportToCSV(data: ReportData[], options: ExportOptions) {
  const processedData = data.map(item => {
    const baseData = {
      'ID': item.id,
      'Название': item.title,
      'Тип': translateType(item.type),
      'Дата': formatDate(item.date),
      'Статус': translateStatus(item.status),
      'Участники': item.participants,
      'Спикер': item.speaker || '',
    }

    const detailData = options.includeDetails ? {
      'Длительность (мин)': formatDuration(item.duration),
      'Описание': item.description || '',
      'Запланировано': formatDate(item.scheduledDate),
      'Начато': formatDate(item.startedAt),
      'Завершено': formatDate(item.stoppedAt),
      'Создано': formatDate(item.createdAt),
      'Обновлено': formatDate(item.updatedAt),
    } : {}

    return { ...baseData, ...detailData }
  })

  // Filter by selected fields
  const filteredData = processedData.map(item => {
    const filtered: Record<string, string | number | boolean> = {}
    if (options.fields.length === 0) {
      return item
    }
    options.fields.forEach(field => {
      if ((item as Record<string, unknown>)[field] !== undefined) {
        filtered[field] = (item as Record<string, unknown>)[field] as string | number | boolean
      }
    })
    return filtered
  })

  const csv = Papa.unparse(filteredData, {
    delimiter: ';',
    header: true
  })

  // Add BOM for proper UTF-8 support in Excel
  const BOM = '\uFEFF'
  const csvWithBOM = BOM + csv

  downloadCSV(csvWithBOM, `reports-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`)
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  try {
    return format(new Date(dateString), 'dd.MM.yyyy HH:mm')
  } catch {
    return dateString
  }
}

function formatDuration(duration: number | undefined): string {
  if (!duration) return ''
  const minutes = Math.floor(duration / 60000)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0) {
    return `${hours}ч ${remainingMinutes}м`
  }
  return `${minutes}м`
}

function translateType(type: string): string {
  const translations: Record<string, string> = {
    'webinar': 'Вебинар',
    'user': 'Пользователь'
  }
  return translations[type] || type
}

function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    'active': 'Активен',
    'completed': 'Завершен',
    'scheduled': 'Запланирован',
    'cancelled': 'Отменен'
  }
  return translations[status] || status
}

export const AVAILABLE_EXPORT_FIELDS = [
  { key: 'ID', label: 'ID' },
  { key: 'Название', label: 'Название' },
  { key: 'Тип', label: 'Тип' },
  { key: 'Дата', label: 'Дата' },
  { key: 'Статус', label: 'Статус' },
  { key: 'Участники', label: 'Участники' },
  { key: 'Спикер', label: 'Спикер' },
  { key: 'Длительность (мин)', label: 'Длительность (мин)' },
  { key: 'Описание', label: 'Описание' },
  { key: 'Запланировано', label: 'Запланировано' },
  { key: 'Начато', label: 'Начато' },
  { key: 'Завершено', label: 'Завершено' },
  { key: 'Создано', label: 'Создано' },
  { key: 'Обновлено', label: 'Обновлено' }
]

export function getDefaultExportFields(): string[] {
  return [
    'ID',
    'Название',
    'Тип',
    'Дата',
    'Статус',
    'Участники',
    'Спикер'
  ]
}