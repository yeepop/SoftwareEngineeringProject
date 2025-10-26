/**
 * Shelters API Client
 * 收容所管理相關 API
 */
import api from './client'
import type { Shelter } from '@/types/models'

export interface ShelterFilters {
  verified?: boolean
  city?: string
  district?: string
  page?: number
  per_page?: number
}

export interface SheltersResponse {
  shelters: Shelter[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

/**
 * 取得收容所列表
 */
export async function getShelters(filters?: ShelterFilters): Promise<SheltersResponse> {
  const response = await api.get('/shelters', { params: filters })
  return response.data
}

/**
 * 取得單一收容所詳情
 */
export async function getShelter(shelterId: number): Promise<Shelter> {
  const response = await api.get(`/shelters/${shelterId}`)
  return response.data
}

/**
 * 建立收容所
 */
export async function createShelter(data: Partial<Shelter>): Promise<Shelter> {
  const response = await api.post('/shelters', data)
  return response.data
}

/**
 * 更新收容所資訊
 */
export async function updateShelter(shelterId: number, data: Partial<Shelter>): Promise<Shelter> {
  const response = await api.patch(`/shelters/${shelterId}`, data)
  return response.data
}

/**
 * 驗證收容所 (管理員專用)
 */
export async function verifyShelter(shelterId: number): Promise<{ message: string }> {
  const response = await api.post(`/shelters/${shelterId}/verify`)
  return response.data
}

/**
 * 批次匯入動物資料 (返回 Job)
 */
export async function batchImportAnimals(shelterId: number, file: File): Promise<{ job_id: number; message: string }> {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post(`/shelters/${shelterId}/animals/batch`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  
  return response.data
}