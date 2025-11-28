// API Response Interfaces (flexible to accommodate actual API structure)
export interface ApiPlanFeature {
  id?: string
  name: string
  value?: string | number | boolean
  included?: boolean
  description?: string
}

export interface ApiPlan {
  id: string | number
  name: string
  description?: string
  price?: number | string
  currency?: string
  period?: string
  features?: ApiPlanFeature[] | string[]
  sortOrder?: number
  isActive?: boolean
  badge?: string | null
  isPopular?: boolean
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

export interface PlansApiResponse {
  success: boolean
  docs?: ApiPlan[]
  data?: ApiPlan[]
  total?: number
  page?: number
  limit?: number
  message?: string
  error?: {
    message: string
    code?: string
  }
}

// Internal Interface (matches existing components)
export interface Plan {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: string[]
  badge: string | null
  isCurrent: boolean
}

// User plan data from existing /api/users/me endpoint
export interface UserPlanData {
  plan?: {
    id: string | number
    name: string
    // ... other plan fields from relationship
  }
  planStatus?: 'active' | 'trialing' | 'paused' | 'canceled' | 'past_due' | 'overdue' | 'expired' | 'inactive' | 'active_until_period_end'
  planBillingCycle?: 'month' | 'year'
  planEndDate?: string
  planCanceledAt?: string
}