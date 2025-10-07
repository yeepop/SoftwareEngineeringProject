import { apiClient } from './client'
import { AdoptionApplication, CreateApplicationDto } from '../types'

export const applicationsApi = {
  async createApplication(data: CreateApplicationDto): Promise<AdoptionApplication> {
    return apiClient.post<AdoptionApplication>('/applications', data)
  },

  async getMyApplications(): Promise<AdoptionApplication[]> {
    return apiClient.get<AdoptionApplication[]>('/applications/my')
  },

  async getApplicationById(id: string): Promise<AdoptionApplication> {
    return apiClient.get<AdoptionApplication>(`/applications/${id}`)
  },

  async updateApplication(id: string, data: Partial<CreateApplicationDto>): Promise<AdoptionApplication> {
    return apiClient.patch<AdoptionApplication>(`/applications/${id}`, data)
  },

  async withdrawApplication(id: string): Promise<void> {
    return apiClient.delete<void>(`/applications/${id}`)
  },
}