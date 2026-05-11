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
  ParticipantInEventResponse,
  RegistrationResponse,
  EventModalityResponse,
  CreateModalityRequest,
} from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'

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

  updateParticipant: (data: CreateParticipantProfileRequest) =>
    fetchApi<ParticipantProfileResponse>('/api/v1/user/profile/participant', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// Modalities endpoints
export const modalities = {
  list: (eventId: string) =>
    fetchApi<EventModalityResponse[]>(`/api/v1/events/${eventId}/modalities`),

  create: (eventId: string, data: CreateModalityRequest) =>
    fetchApi<EventModalityResponse>(`/api/v1/events/${eventId}/modalities`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (eventId: string, modalityId: string) =>
    fetchApi<void>(`/api/v1/events/${eventId}/modalities/${modalityId}`, {
      method: 'DELETE',
    }),
}

// Registrations endpoints
export const registrations = {
  getByEvent: (eventId: string) =>
    fetchApi<ParticipantInEventResponse[]>(`/api/v1/events/${eventId}/registrations`),

  register: (eventId: string, modalityId?: string) =>
    fetchApi<RegistrationResponse>(`/api/v1/events/${eventId}/register`, {
      method: 'POST',
      body: modalityId ? JSON.stringify({ modalityId }) : undefined,
    }),

  cancel: (eventId: string, registrationId: string) =>
    fetchApi<void>(`/api/v1/events/${eventId}/registrations/${registrationId}`, {
      method: 'DELETE',
    }),

  getMyRegistrations: () =>
    fetchApi<RegistrationResponse[]>('/api/v1/user/registrations'),

  downloadTicket: async (registrationId: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const response = await fetch(
      `${API_BASE_URL}/api/v1/user/registrations/${registrationId}/ticket`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    )
    if (!response.ok) throw new ApiError('Error al descargar el boleto', response.status)

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `boleto-${registrationId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  },
}

// Check-in endpoints
export const checkin = {
  findByCode: (ticketCode: string) =>
    fetchApi<ParticipantInEventResponse>(`/api/v1/registrations/${ticketCode}`),

  markKitDelivered: (ticketCode: string) =>
    fetchApi<ParticipantInEventResponse>(`/api/v1/registrations/${ticketCode}/kit-pickup`, {
      method: 'PUT',
    }),
}

export { ApiError }
