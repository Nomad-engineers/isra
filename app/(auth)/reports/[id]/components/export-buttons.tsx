"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface ExportButtonsProps {
  webinarId: string
  webinarTitle: string
}

type ExportFormat = 'xlsx' | 'pdf' | 'html'

export function ExportButtons({ webinarId, webinarTitle }: ExportButtonsProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null)

  const handleExport = async (format: ExportFormat) => {
    setExporting(format)
    
    try {
      // Simulate export - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const formatLabels = {
        xlsx: 'Excel',
        pdf: 'PDF',
        html: 'HTML'
      }
      
      toast.success(`Отчет успешно экспортирован в ${formatLabels[format]}`, {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      })
      
      // Here you would trigger actual download
      // window.open(`/api/reports/${webinarId}/export?format=${format}`, '_blank')
      
    } catch (error) {
      toast.error('Ошибка экспорта отчета')
    } finally {
      setExporting(null)
    }
  }

  const exportOptions = [
    {
      format: 'xlsx' as ExportFormat,
      label: 'Excel (XLSX)',
      description: 'Таблица с данными',
      icon: FileSpreadsheet,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
    {
      format: 'pdf' as ExportFormat,
      label: 'PDF',
      description: 'Документ для печати',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100',
    },
    {
      format: 'html' as ExportFormat,
      label: 'HTML',
      description: 'Веб-страница',
      icon: FileCode,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
  ]

  return (
    <div className="flex items-center gap-2">
      {/* Quick Export Buttons - Desktop */}
      <div className="hidden md:flex items-center gap-2">
        {exportOptions.map((option) => (
          <Button
            key={option.format}
            variant="outline"
            size="sm"
            onClick={() => handleExport(option.format)}
            disabled={exporting !== null}
            className={`${option.bgColor} border-transparent transition-all duration-200`}
          >
            {exporting === option.format ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <option.icon className={`h-4 w-4 mr-2 ${option.color}`} />
            )}
            <span className={option.color}>{option.label}</span>
          </Button>
        ))}
      </div>

      {/* Dropdown for Mobile */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={exporting !== null}>
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Экспорт
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Выберите формат</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {exportOptions.map((option) => (
              <DropdownMenuItem
                key={option.format}
                onClick={() => handleExport(option.format)}
                className="cursor-pointer"
              >
                <option.icon className={`h-4 w-4 mr-3 ${option.color}`} />
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

