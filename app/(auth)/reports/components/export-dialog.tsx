import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ReportsParams, ReportData } from '@/api/reports/types'
import { exportToCSV, AVAILABLE_EXPORT_FIELDS, getDefaultExportFields } from '@/lib/csv-export'
import { reportsApi } from '@/api/reports'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Download, FileText, Calendar } from 'lucide-react'

interface ExportDialogProps {
  params: ReportsParams
  onClose: () => void
  data: ReportData[]
}

export function ExportDialog({ params, onClose, data }: ExportDialogProps) {
  const [exportOptions, setExportOptions] = useState({
    includeDetails: true,
    dateFrom: params.dateFrom || format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    dateTo: params.dateTo || format(new Date(), 'yyyy-MM-dd'),
    fields: getDefaultExportFields(),
    dataType: params.dataType || 'both'
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleFieldToggle = (field: string, checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      fields: checked
        ? [...prev.fields, field]
        : prev.fields.filter(f => f !== field)
    }))
  }

  const handleSelectAllFields = (checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      fields: checked ? AVAILABLE_EXPORT_FIELDS.map(f => f.key) : []
    }))
  }

  const handleExport = async () => {
    if (exportOptions.fields.length === 0) {
      toast.error('Выберите хотя бы одно поле для экспорта')
      return
    }

    setIsExporting(true)

    try {
      // Get data for export based on current filters and date range
      const exportParams: ReportsParams = {
        ...params,
        dateFrom: exportOptions.dateFrom,
        dateTo: exportOptions.dateTo,
        dataType: exportOptions.dataType,
        limit: 10000 // Get all data for export
      }

      const exportData = await reportsApi.exportReports(exportParams)

      if (exportData.length === 0) {
        toast.error('Нет данных для экспорта в выбранном периоде')
        return
      }

      // Export to CSV
      await exportToCSV(exportData, exportOptions)

      toast.success(`Экспортировано ${exportData.length} записей`)
      onClose()
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Ошибка при экспорте данных')
    } finally {
      setIsExporting(false)
    }
  }

  const isAllFieldsSelected = exportOptions.fields.length === AVAILABLE_EXPORT_FIELDS.length
  const isSomeFieldsSelected = exportOptions.fields.length > 0 && !isAllFieldsSelected

  return (
    <div className="space-y-6">
      {/* Date Range */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <Label className="text-sm font-medium">Период экспорта</Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateFrom">Дата начала</Label>
            <Input
              id="dateFrom"
              type="date"
              value={exportOptions.dateFrom}
              onChange={(e) => setExportOptions(prev => ({ ...prev, dateFrom: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateTo">Дата окончания</Label>
            <Input
              id="dateTo"
              type="date"
              value={exportOptions.dateTo}
              onChange={(e) => setExportOptions(prev => ({ ...prev, dateTo: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Data Type */}
      <div className="space-y-2">
        <Label>Тип данных</Label>
        <Select
          value={exportOptions.dataType}
          onValueChange={(value: 'webinars' | 'users' | 'both') =>
            setExportOptions(prev => ({ ...prev, dataType: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">Все данные</SelectItem>
            <SelectItem value="webinars">Только вебинары</SelectItem>
            <SelectItem value="users">Только пользователи</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Detail Level */}
      <div className="space-y-3">
        <Label>Уровень детализации</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeDetails"
              checked={exportOptions.includeDetails}
              onCheckedChange={(checked) =>
                setExportOptions(prev => ({ ...prev, includeDetails: checked as boolean }))
              }
            />
            <Label htmlFor="includeDetails" className="text-sm">
              Включить подробную информацию (даты создания, описания и т.д.)
            </Label>
          </div>
        </div>
      </div>

      {/* Field Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Поля для экспорта</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="selectAllFields"
              checked={isAllFieldsSelected}
              ref={(checkbox) => {
                if (checkbox) {
                  (checkbox as HTMLInputElement).indeterminate = isSomeFieldsSelected
                }
              }}
              onCheckedChange={handleSelectAllFields}
            />
            <Label htmlFor="selectAllFields" className="text-sm">
              Выбрать все
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
          {AVAILABLE_EXPORT_FIELDS.map((field) => (
            <div key={field.key} className="flex items-center space-x-2">
              <Checkbox
                id={`field-${field.key}`}
                checked={exportOptions.fields.includes(field.key)}
                onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
              />
              <Label htmlFor={`field-${field.key}`} className="text-sm">
                {field.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Export Info */}
      <div className="bg-muted/50 p-3 rounded-md">
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Будет экспортировано до 10 000 записей</p>
          <p>• Формат: CSV с разделителем ;</p>
          <p>• Кодировка: UTF-8</p>
          <p>• Выбрано полей: {exportOptions.fields.length}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose} disabled={isExporting}>
          Отмена
        </Button>
        <Button
          onClick={handleExport}
          disabled={isExporting || exportOptions.fields.length === 0}
        >
          {isExporting ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
              Экспорт...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Экспортировать CSV
            </>
          )}
        </Button>
      </div>
    </div>
  )
}