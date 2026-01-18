import { BASE_URL } from './constants'

const FALLBACK_BASE_URL = 'https://dev.isra-cms.nomad-engineers.space/api'

const resolveApiUrl = (endpoint: string) => {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint
  }

  const rawBase = (BASE_URL || '').trim()
  const base = /^https?:\/\//i.test(rawBase) ? rawBase : FALLBACK_BASE_URL
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  return `${normalizedBase}${normalizedEndpoint}`
}

/**
 * Centralized fetch utility that automatically prepends BASE_URL to all requests.
 * Use this for all API calls instead of native fetch to ensure consistent URL handling.
 *
 * @example
 * // Instead of: fetch(`${BASE_URL}/users/me`, ...)
 * // Use:
 * apiFetch('/users/me', ...)
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = resolveApiUrl(endpoint)

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
