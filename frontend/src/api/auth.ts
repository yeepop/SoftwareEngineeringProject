import { apiClient } from './client'
import { LoginDto, RegisterDto } from '../types'

interface AuthResponse {
  access_token: string
}

export const authApi = {
  async login(data: LoginDto): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', data)
  },

  async register(data: RegisterDto): Promise<void> {
    return apiClient.post<void>('/auth/register', data)
  },

  async getProfile() {
    return apiClient.get('/users/profile')
  },
}