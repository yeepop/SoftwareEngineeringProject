import { apiClient } from './client'
import { AdoptionApplication, AnimalListing, PaginatedResponse } from '../types'

interface ReviewApplicationDto {
  status: 'APPROVED' | 'REJECTED'
  reviewNotes?: string
}

export const adminApi = {
  async getApplications(
    page = 1,
    limit = 10,
    status?: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  ): Promise<PaginatedResponse<AdoptionApplication>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    if (status) {
      params.append('status', status)
    }
    return apiClient.get<PaginatedResponse<AdoptionApplication>>(`/admin/applications?${params}`)
  },

  async reviewApplication(id: string, data: ReviewApplicationDto): Promise<AdoptionApplication> {
    return apiClient.patch<AdoptionApplication>(`/admin/applications/${id}/review`, data)
  },

  async getAllListings(
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<AnimalListing>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    return apiClient.get<PaginatedResponse<AnimalListing>>(`/admin/listings?${params}`)
  },

  async updateListingStatus(
    id: string,
    status: 'AVAILABLE' | 'PENDING' | 'ADOPTED' | 'WITHDRAWN'
  ): Promise<AnimalListing> {
    return apiClient.patch<AnimalListing>(`/admin/listings/${id}/status`, { status })
  },

  async getStats(): Promise<{
    totalListings: number
    totalApplications: number
    pendingApplications: number
    adoptedAnimals: number
  }> {
    return apiClient.get('/admin/stats')
  },
}