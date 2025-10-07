export interface User {
  id: string
  name: string
  email: string
  role: 'adopter' | 'owner' | 'admin'
  profileCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface AnimalListing {
  id: string
  ownerId: string
  species: string
  breed?: string
  ageEstimate?: number
  gender?: string
  spayedNeutered: boolean
  description?: string
  location: string
  photos: string
  healthStatus?: string
  vaccinationRecords?: string
  status: string
  createdAt: string
  updatedAt: string
  owner?: {
    id: string
    name: string
  }
}

export interface AdoptionApplication {
  id: string
  listingId: string
  applicantId?: string
  answers: string
  status: string
  submittedAt: string
  reviewedAt?: string
  reviewerId?: string
  reviewNotes?: string
  animal?: AnimalListing
  user?: User
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  username: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
}

export interface CreateListingDto {
  name: string
  species: 'CAT' | 'DOG'
  breed?: string
  age: number
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN'
  size: 'SMALL' | 'MEDIUM' | 'LARGE'
  color?: string
  description: string
  healthInfo?: string
  behaviorNotes?: string
  specialNeeds?: string
  adoptionFee: number
  location: string
  contactInfo: Record<string, any>
  images: string[]
  isVaccinated: boolean
  isSpayedNeutered: boolean
}

export interface CreateApplicationDto {
  animalId: string
  personalInfo: Record<string, any>
  livingSituation: Record<string, any>
  experienceWithPets?: Record<string, any>
  additionalInfo?: Record<string, any>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface FilterOptions {
  species?: 'CAT' | 'DOG'
  minAge?: number
  maxAge?: number
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN'
  size?: 'SMALL' | 'MEDIUM' | 'LARGE'
  location?: string
  isVaccinated?: boolean
  isSpayedNeutered?: boolean
  maxFee?: number
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterDto) => Promise<void>
  logout: () => void
  loading: boolean
}