"use client"

import { useState, useEffect, useCallback } from 'react'
import { reportsApi } from '@/api/reports'
import { ReportData, ReportsParams, ReportStats } from '@/api/reports/types'
import { ReportsHeader } from './components/reports-header'
import { ReportsStats } from './components/reports-stats'
import { ReportsTable } from './components/reports-table'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function ReportsPage() {
  const [data, setData] = useState<ReportData[]>([])
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<ReportsParams>({
    page: 1,
    limit: 10,
    dataType: 'both'
  })
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await reportsApi.getReports(params)
      setData(response.data)
      setStats(response.stats)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (err) {
      console.error('Reports fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch reports')
      toast.error('Ошибка загрузки отчетов')
    } finally {
      setLoading(false)
    }
  }, [params])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefreshEnabled) return

    const interval = setInterval(() => {
      fetchData()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [autoRefreshEnabled, fetchData])

  const handleParamsChange = useCallback((newParams: Partial<ReportsParams>) => {
    setParams(prev => ({ ...prev, ...newParams, page: 1 }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }))
  }, [])

  const handleRefresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Загрузка отчетов...</p>
        </div>
      </div>
    )
  }

  if (error && data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-destructive">
            <p className="text-lg font-semibold">Ошибка загрузки</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Повторить попытку
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with controls */}
      <ReportsHeader
        params={params}
        onParamsChange={handleParamsChange}
        onRefresh={handleRefresh}
        loading={loading}
        autoRefreshEnabled={autoRefreshEnabled}
        onAutoRefreshToggle={setAutoRefreshEnabled}
        data={data}
      />

      {/* Statistics Cards */}
      <ReportsStats stats={stats} loading={loading} />

      {/* Data Table */}
      <ReportsTable
        data={data}
        stats={stats}
        loading={loading}
        params={params}
        onParamsChange={handleParamsChange}
        total={total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}