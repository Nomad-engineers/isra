import { BASE_URL } from './constants'

interface ApiClientOptions {
  baseUrl?: string
  headers?: Record<string, string>
  interceptors?: {
    request?: (config: RequestInit) => RequestInit
    response?: (response: Response) => Response | Promise<Response>
  }
}

export class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private interceptors: ApiClientOptions['interceptors']

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || BASE_URL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    this.interceptors = options.interceptors || {}
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    let config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    }

    // Request interceptor
    if (this.interceptors?.request) {
      config = this.interceptors.request(config)
    }

    const response = await fetch(url, config)

    // Response interceptor
    let processedResponse = response
    if (this.interceptors?.response) {
      processedResponse = await this.interceptors.response(response)
    }

    if (!processedResponse.ok) {
      const errorData = await processedResponse.json().catch(() => ({}))
      throw new Error(errorData.message || `API Error: ${processedResponse.status} ${processedResponse.statusText}`)
    }

    return processedResponse.json()
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): Promise<T> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    return this.request<T>(url)
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}