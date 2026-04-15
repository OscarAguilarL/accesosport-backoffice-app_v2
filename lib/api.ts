import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  EventResponse,
  EventSummaryResponse,
  CreateEventRequest,
  UpdateEventRequest,
  OrganizerProfileResponse,
  OrganizerProfileWithTokenResponse,
  CreateOrganizerProfileRequest,
  UserInformationDto,
  SavePersonalDataRequest,
  SaveUserAddressRequest,
  ParticipantProfileResponse,
  CreateParticipantProfileRequest,
} from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

class ApiError extends Error {
  status: number
  detail?: string
  
  constructor(message: string, status: number, detail?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.title || 'An error occurred',
      response.status,
      errorData.detail
    )
  }
  
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T
  }
  
  return response.json()
}

// Auth endpoints
export const auth = {
  login: (data: LoginRequest) =>
    fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  signup: (data: RegisterRequest) =>
    fetchApi<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Events endpoints
export const events = {
  list: (status?: EventSummaryResponse['status']) =>
    fetchApi<EventSummaryResponse[]>(
      status ? `/api/v1/events?eventStatus=${status}` : '/api/v1/events'
    ),
    
  listMyEvents: () =>
    fetchApi<EventSummaryResponse[]>('/api/v1/events/my-events'),

  listAvailable: () =>
    fetchApi<EventSummaryResponse[]>('/api/v1/events/available'),

  get: (eventId: string) =>
    fetchApi<EventResponse>(`/api/v1/events/${eventId}`),
    
  create: (data: CreateEventRequest) =>
    fetchApi<EventResponse>('/api/v1/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (eventId: string, data: UpdateEventRequest) =>
    fetchApi<EventResponse>(`/api/v1/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  publish: (eventId: string) =>
    fetchApi<EventResponse>(`/api/v1/events/${eventId}/publish`, {
      method: 'PUT',
    }),
    
  openRegistration: (eventId: string) =>
    fetchApi<EventResponse>(`/api/v1/events/${eventId}/open-registration`, {
      method: 'PUT',
    }),

  complete: (eventId: string) =>
    fetchApi<EventResponse>(`/api/v1/events/${eventId}/complete`, {
      method: 'PUT',
    }),

  cancel: (eventId: string, reason?: string) =>
    fetchApi<EventResponse>(`/api/v1/events/${eventId}/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`, {
      method: 'DELETE',
    }),
    
  uploadCoverImage: async (eventId: string, file: File) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE_URL}/api/v1/events/${eventId}/cover-image`, {
      method: 'PUT',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    })
    
    if (!response.ok) {
      throw new ApiError('Failed to upload image', response.status)
    }
    
    return response.json() as Promise<EventResponse>
  },
  
  getGallery: (eventId: string) =>
    fetchApi<{ id: string; imageUrl: string; displayOrder: number }[]>(`/api/v1/events/${eventId}/images`),
    
  addGalleryImage: async (eventId: string, file: File) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE_URL}/api/v1/events/${eventId}/images`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    })
    
    if (!response.ok) {
      throw new ApiError('Failed to upload image', response.status)
    }
    
    return response.json()
  },
  
  removeGalleryImage: (eventId: string, imageId: string) =>
    fetchApi<void>(`/api/v1/events/${eventId}/images/${imageId}`, {
      method: 'DELETE',
    }),
}

// User endpoints
export const user = {
  getMe: () =>
    fetchApi<UserInformationDto>('/api/v1/user/me'),

  savePersonalData: (data: SavePersonalDataRequest) =>
    fetchApi<void>('/api/v1/user/personal-information', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  saveAddress: (data: SaveUserAddressRequest) =>
    fetchApi<void>('/api/v1/user/address', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// Profile endpoints
export const profile = {
  getOrganizer: () =>
    fetchApi<OrganizerProfileResponse>('/api/v1/user/profile/organizer'),
    
  createOrganizer: (data: CreateOrganizerProfileRequest) =>
    fetchApi<OrganizerProfileWithTokenResponse>('/api/v1/user/profile/organizer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  uploadOrganizerLogo: async (file: File) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/v1/user/profile/organizer/logo`, {
      method: 'PUT',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    })

    if (!response.ok) {
      throw new ApiError('Failed to upload logo', response.status)
    }

    return response.json() as Promise<OrganizerProfileResponse>
  },

  getParticipant: () =>
    fetchApi<ParticipantProfileResponse>('/api/v1/user/profile/participant'),

  createParticipant: (data: CreateParticipantProfileRequest) =>
    fetchApi<ParticipantProfileResponse>('/api/v1/user/profile/participant', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

export { ApiError }
