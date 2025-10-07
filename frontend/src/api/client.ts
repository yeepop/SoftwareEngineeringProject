const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
    }
    
    const config: RequestInit = {
      headers: {
        ...defaultHeaders,
        ...(options.headers as Record<string, string> || {}),
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }))
      throw new Error(error.message || 'Request failed')
    }

    return response.json()
  }

  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
export default apiClient