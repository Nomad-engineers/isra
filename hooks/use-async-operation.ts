import { useState, useCallback } from 'react'

export function useAsyncOperation<T extends any[], R>(operation: (...args: T) => Promise<R>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (...args: T): Promise<R | null> => {
      setLoading(true)
      setError(null)

      try {
        const result = await operation(...args)
        return result
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Неизвестная ошибка'))
        return null
      } finally {
        setLoading(false)
      }
    },
    [operation]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  return {
    execute,
    loading,
    error,
    reset,
  }
}