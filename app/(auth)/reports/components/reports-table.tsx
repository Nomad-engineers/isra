import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { ReportData, ReportsParams, ReportStats } from '@/api/reports/types'
import { getStatusColor, getStatusLabel, formatDuration } from '@/lib/report-calculations'
import { format } from 'date-fns'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Eye,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

type SortField = 'title' | 'date' | 'participants' | 'status' | 'type'
type SortDirection = 'asc' | 'desc'

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
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortField(field)
    setSortDirection(newDirection)

    onParamsChange({
      sortBy: field,
      sortOrder: newDirection
    })
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />
  }

  const handleExportSingle = (item: ReportData) => {
    // Export single item functionality
    console.log('Export single item:', item)
  }

  const handleViewItem = (item: ReportData) => {
    // View item details functionality
    console.log('View item:', item)
  }

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Показать:</span>
          <Select
            value={params.limit?.toString() || '10'}
            onValueChange={(value) => onParamsChange({ limit: parseInt(value) })}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            записей из {total}
          </span>
        </div>

        {stats && (
          <div className="text-sm text-muted-foreground">
            Всего участников: <span className="font-medium">{stats.totalParticipants.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('title')}
                >
                  Название
                  {getSortIcon('title')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('type')}
                >
                  Тип
                  {getSortIcon('type')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('date')}
                >
                  Дата
                  {getSortIcon('date')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('status')}
                >
                  Статус
                  {getSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('participants')}
                >
                  Участники
                  {getSortIcon('participants')}
                </Button>
              </TableHead>
              <TableHead>Спикер</TableHead>
              <TableHead>Длительность</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: params.limit || 10 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded w-16" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded w-24" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded w-16" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded w-24" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded w-16" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 bg-muted animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Нет данных для отображения
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.type === 'webinar' ? 'Вебинар' : 'Пользователь'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(item.date), 'dd.MM.yyyy HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {item.participants.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {item.speaker || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDuration(item.duration)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewItem(item)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Детали
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportSingle(item)}>
                          <Download className="h-4 w-4 mr-2" />
                          Экспортировать
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => params.page && params.page > 1 && onPageChange(params.page - 1)}
                  className={params.page && params.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  size="sm"
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                const pageNumber = index + 1
                const isCurrentPage = params.page === pageNumber

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => onPageChange(pageNumber)}
                      isActive={isCurrentPage}
                      className="cursor-pointer"
                      size="sm"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              {totalPages > 5 && (
                <>
                  <PaginationItem>
                    <span className="px-2">...</span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => onPageChange(totalPages)}
                      isActive={params.page === totalPages}
                      className="cursor-pointer"
                      size="sm"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => params.page && params.page < totalPages && onPageChange(params.page + 1)}
                  className={params.page && params.page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  size="sm"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}