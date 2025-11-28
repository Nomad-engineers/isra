'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { useTokenAuth } from '@/hooks/use-token-auth'
import { Plan, UserPlanData } from '@/types/plan'
import {
  fetchPlansFromApi,
  fetchUserPlanData,
  markCurrentPlan,
  getFallbackPlans
} from '@/lib/plans-service'

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [userPlanData, setUserPlanData] = useState<UserPlanData | null>(null)

  const { toast } = useToast()
  const { getToken, checkAuth } = useTokenAuth()
  const router = useRouter()

  const fetchPlans = useCallback(async (useFallback = false) => {
    try {
      setLoading(true)
      setError(null)

      if (useFallback) {
        const fallbackPlans = getFallbackPlans()
        setPlans(fallbackPlans)
        setLoading(false)
        return
      }

      // Fetch plans from public API (no authentication required)
      let fetchedPlans = await fetchPlansFromApi()

      // If user is authenticated, fetch their plan data and mark current plan
      const token = getToken()
      if (token) {
        const userData = await fetchUserPlanData(token)
        setUserPlanData(userData)

        if (userData) {
          fetchedPlans = markCurrentPlan(fetchedPlans, userData)
        }
      }

      setPlans(fetchedPlans)

    } catch (error) {
      console.error('Plans fetch error:', error)

      const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить тарифы'
      setError(errorMessage)

      // Use fallback plans on error
      const fallbackPlans = getFallbackPlans()
      setPlans(fallbackPlans)

      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить актуальные тарифы. Показаны базовые тарифы.',
        variant: 'destructive',
      })

    } finally {
      setLoading(false)
    }
  }, [])

  const retry = useCallback(async () => {
    setRetryCount(prev => prev + 1)

    try {
      setLoading(true)
      setError(null)
      let fetchedPlans = await fetchPlansFromApi()
      const token = getToken()
      if (token) {
        const userData = await fetchUserPlanData(token)
        setUserPlanData(userData)
        if (userData) {
          fetchedPlans = markCurrentPlan(fetchedPlans, userData)
        }
      }
      setPlans(fetchedPlans)
    } catch (error) {
      console.error('Retry error:', error)
      const fallbackPlans = getFallbackPlans()
      setPlans(fallbackPlans)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  const useFallbackMode = useCallback(() => {
    setPlans(getFallbackPlans())
    setLoading(false)
    setError(null)
  }, [getFallbackPlans])

  // Initial fetch
  useEffect(() => {
    fetchPlans(retryCount > 2) // Use fallback after 2 failed attempts
  }, []) // Remove fetchPlans and retryCount from dependencies to prevent infinite loops

  return {
    plans,
    loading,
    error,
    retry,
    useFallbackMode,
    isUsingFallback: error !== null && retryCount > 2,
    userPlanData,
    currentPlan: plans.find(plan => plan.isCurrent) || null,
    planStatus: userPlanData?.planStatus || null,
    planEndDate: userPlanData?.planEndDate || null
  }
}