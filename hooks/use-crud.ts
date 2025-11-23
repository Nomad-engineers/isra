import { useState, useCallback, useEffect } from 'react'
import { BaseEntity } from '@/types/common'

interface UseCrudOptions<T, CreateData> {
  api: {
    getAll: (params?: any) => Promise<T[]>
    create: (data: CreateData) => Promise<T>
    update: (id: string, data: Partial<CreateData>) => Promise<T>
    delete: (id: string) => Promise<void>
  }
  initialParams?: Record<string, any>
  autoFetch?: boolean
}

export function useCrud<T extends BaseEntity, CreateData>(options: UseCrudOptions<T, CreateData>) {
  const { api, initialParams, autoFetch = true } = options

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true)
      setError(null)
      try {
        const result = await api.getAll({ ...initialParams, ...params })
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных')
      } finally {
        setLoading(false)
      }
    },
    [api, initialParams]
  )

  const create = useCallback(
    async (newData: CreateData): Promise<T | null> => {
      setLoading(true)
      setError(null)
      try {
        const result = await api.create(newData)
        setData((prev) => [...prev, result])
        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при создании')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [api]
  )

  const update = useCallback(
    async (id: string, updateData: Partial<CreateData>): Promise<T | null> => {
      setLoading(true)
      setError(null)
      try {
        const result = await api.update(id, updateData)
        setData((prev) => prev.map((item) => (item.id === id ? result : item)))
        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при обновлении')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [api]
  )

  const remove = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        await api.delete(id)
        setData((prev) => prev.filter((item) => item.id !== id))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при удалении')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [api]
  )

  const refetch = useCallback(() => {
    fetch()
  }, [fetch])

  useEffect(() => {
    if (autoFetch) {
      fetch()
    }
  }, [fetch, autoFetch])

  return {
    data,
    loading,
    error,
    refetch,
    create,
    update,
    delete: remove,
  }
}