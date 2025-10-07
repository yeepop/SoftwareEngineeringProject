import { apiClient } from './client'
import { AnimalListing, CreateListingDto, PaginatedResponse, FilterOptions } from '../types'

export const listingsApi = {
  async getListings(
    page = 1,
    limit = 10,
    filters: FilterOptions = {}
  ): Promise<PaginatedResponse<AnimalListing>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      ),
    })
    return apiClient.get<PaginatedResponse<AnimalListing>>(`/listings?${params}`)
  },

  async getListingById(id: string): Promise<AnimalListing> {
    return apiClient.get<AnimalListing>(`/listings/${id}`)
  },

  async createListing(data: CreateListingDto): Promise<AnimalListing> {
    return apiClient.post<AnimalListing>('/listings', data)
  },

  async updateListing(id: string, data: Partial<CreateListingDto>): Promise<AnimalListing> {
    return apiClient.patch<AnimalListing>(`/listings/${id}`, data)
  },

  async deleteListing(id: string): Promise<void> {
    return apiClient.delete<void>(`/listings/${id}`)
  },

  async getMyListings(): Promise<AnimalListing[]> {
    return apiClient.get<AnimalListing[]>('/listings/my')
  },
}