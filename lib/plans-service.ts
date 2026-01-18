import { ApiPlan, PlansApiResponse, Plan, UserPlanData } from '@/types/plan'

import { apiFetch } from './api-fetch'


/**
 * Transform API plan data to match internal Plan interface
 */
export function transformApiPlanToPlan(apiPlan: ApiPlan): Plan {
  // Handle features - convert from API format to string array
  let features: string[] = []

  if (Array.isArray(apiPlan.features)) {
    features = apiPlan.features.map(feature => {
      if (typeof feature === 'string') return feature
      if (typeof feature === 'object' && feature.name) {
        return feature.included === false ? `❌ ${feature.name}` : feature.name
      }
      return String(feature)
    })
  }

  // Format price with currency
  let formattedPrice = 'Бесплатно'
  const price = apiPlan.price

  if (price) {
    const numPrice = typeof price === 'number' ? price : parseFloat(String(price))
    if (!isNaN(numPrice) && numPrice > 0) {
      formattedPrice = `${numPrice.toLocaleString('ru-RU')} ${apiPlan.currency || '₸'}`
    }
  }

  // Handle period - for monthly pricing, assume monthly if not specified
  let period = apiPlan.period || ''
  if (!period && price && price !== 0) {
    period = '/мес'
  }
  if (period && !period.startsWith('/')) {
    period = `/${period}`
  }

  return {
    id: String(apiPlan.id),
    name: apiPlan.name.toUpperCase(),
    price: formattedPrice,
    period,
    description: apiPlan.description || '',
    features,
    badge: apiPlan.badge || (apiPlan.isPopular ? 'Популярный' : null),
    isCurrent: false // This will be determined based on user's current subscription
  }
}

/**
 * Fetch plans from the API (public endpoint - no authentication required)
 */
export async function fetchPlansFromApi(): Promise<Plan[]> {
  try {
    const result: PlansApiResponse = await apiFetch<PlansApiResponse>('/plans?sort=sortOrder')

    // Handle different response formats
    const apiPlans = result.docs || result.data || []

    if (!Array.isArray(apiPlans)) {
      throw new Error('Invalid API response format')
    }

    // Transform and filter active plans
    const plans = apiPlans
      .filter((plan: ApiPlan) => plan.isActive !== false) // Include plans unless explicitly inactive
      .map(transformApiPlanToPlan)
      .sort((a, b) => a.name.localeCompare(b.name)) // Sort by name as fallback

    return plans

  } catch (error) {
    console.error('Error fetching plans:', error)
    throw error
  }
}

/**
 * Fetch current user's plan data from existing /api/users/me endpoint
 */
export async function fetchUserPlanData(token: string): Promise<UserPlanData | null> {
  try {

    const userData = await apiFetch<{ user?: any } & any>('/users/me', {

      headers: {
        'Authorization': `JWT ${token}`,
      },
    }).catch(() => null)

    if (!userData) {
      return null
    }

    // Handle different response formats
    const user = userData.user || userData

    return {
      plan: user.plan,
      planStatus: user.planStatus,
      planBillingCycle: user.planBillingCycle,
      planEndDate: user.planEndDate,
      planCanceledAt: user.planCanceledAt,
    }
  } catch (error) {
    console.error('Error fetching user plan data:', error)
    return null
  }
}

/**
 * Mark current plan based on user's subscription data
 */
export function markCurrentPlan(plans: Plan[], userPlanData: UserPlanData | null): Plan[] {
  if (!userPlanData?.plan) {
    return plans
  }

  const currentPlanId = String(userPlanData.plan.id)

  return plans.map(plan => ({
    ...plan,
    isCurrent: plan.id === currentPlanId
  }))
}

/**
 * Get fallback plans if API fails
 */
export function getFallbackPlans(): Plan[] {
  return [
    {
      id: 'basic',
      name: 'BASIC',
      price: 'Бесплатно',
      period: '',
      description: 'Для малого бизнеса и блогеров',
      features: [
        'По балансу (20₸/участник)',
        '2 комнат',
        '1ГБ хранилище',
        '20.00₸ за автовебинар'
      ],
      badge: null,
      isCurrent: false
    },
    {
      id: 'starter',
      name: 'STARTER',
      price: '8 990 ₸',
      period: '/мес',
      description: 'Для малого бизнеса и блогеров',
      features: [
        '100 участников',
        '10 комнат',
        '10ГБ хранилище',
        '15.00₸ за автовебинар'
      ],
      badge: null,
      isCurrent: false
    },
    {
      id: 'professional',
      name: 'PROFESSIONAL',
      price: '24 990 ₸',
      period: '/мес',
      description: 'Для профессионального использования',
      features: [
        '500 участников',
        '50 комнат',
        '50ГБ хранилище',
        '12.00₸ за автовебинар'
      ],
      badge: null,
      isCurrent: false
    },
    {
      id: 'enterprise',
      name: 'ENTERPRISE',
      price: 'Безлимит',
      period: '',
      description: 'Корпоративные решения без ограничений',
      features: [
        'Безлимит участников',
        'Безлимит комнат',
        '100ГБ хранилище',
        '10.00₸ за автовебинар'
      ],
      badge: null,
      isCurrent: false
    }
  ]
}