// API Types based on OpenAPI spec

export interface AuthResponse {
  id: string
  email: string
  roles: string[]
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  passwordConfirmation: string
}

export interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  properties?: Record<string, unknown>
}

export interface LocationDto {
  place?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  fullAddress?: string
}

export interface RegistrationPeriodDto {
  start?: string
  end?: string
}

export interface OrganizerDto {
  id?: string
  email?: string
}

export interface EventImageResponse {
  id?: string
  imageUrl?: string
  displayOrder?: number
}

export interface EventResponse {
  id?: string
  name?: string
  description?: string
  eventDate?: string
  location?: LocationDto
  modalities?: EventModalityResponse[]
  registrationPeriod?: RegistrationPeriodDto
  status?: string
  canRegister?: boolean
  organizer?: OrganizerDto
  coverImageUrl?: string
  galleryImages?: EventImageResponse[]
  createdAt?: string
  waiverTemplate?: string
}

export interface EventSummaryResponse {
  id?: string
  name?: string
  eventDate?: string
  location?: string
  minPrice?: number
  totalAvailableSpots?: number
  status?: string
  canRegister?: boolean
  coverImageUrl?: string
}

export interface RegistrationResponse {
  id: string
  eventId: string
  eventName: string | null
  eventDate: string | null
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED'
  ticketCode: string
  registeredAt: string
}

export interface CreateEventRequest {
  name: string
  description?: string
  eventDate: string
  place: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  registrationStartDate: string
  registrationEndDate: string
  modalities: CreateModalityRequest[]
}

export interface UpdateEventRequest {
  name?: string
  description?: string
  eventDate?: string
  place?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  registrationStartDate?: string
  registrationEndDate?: string
  waiverTemplate?: string
}

export interface OrganizerProfileResponse {
  id?: string
  organizationName?: string
  logoUrl?: string
  website?: string
  facebook?: string
  instagram?: string
  description?: string
  verificationStatus?: string
  verifiedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface OrganizerProfileWithTokenResponse {
  token: string
  profile: OrganizerProfileResponse
}

export interface CreateOrganizerProfileRequest {
  organizationName: string
  website?: string
  facebook?: string
  instagram?: string
  description?: string
}

export interface SavePersonalDataRequest {
  firstName: string
  lastName: string
  secondLastName?: string
  birthDate: string
  gender: string
  phoneNumber: string
}

export interface SaveUserAddressRequest {
  street: string
  externalNumber: string
  internalNumber?: string
  neighborhood: string
  city: string
  state: string
  country: string
  zipCode: string
}

export interface UserInformationDto {
  id?: string
  email?: string
  firstName?: string
  lastName?: string
  secondLastName?: string
  birthDate?: string
  gender?: string
  phoneNumber?: string
  address?: AddressDto
}

export interface AddressDto {
  street?: string
  externalNumber?: string
  internalNumber?: string
  neighborhood?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
}

// Event status types
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

// Race types with labels
export const RACE_TYPES = {
  MARATHON: 'Maratón',
  HALF_MARATHON: 'Medio Maratón',
  TEN_KM: '10K',
  FIVE_KM: '5K',
  OTHER: 'Otro',
} as const

export const EVENT_STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
  DRAFT: { label: 'Borrador', variant: 'secondary' },
  PUBLISHED: { label: 'Publicado', variant: 'default' },
  REGISTRATION_OPEN: { label: 'Inscripciones Abiertas', variant: 'success' },
  REGISTRATION_CLOSED: { label: 'Inscripciones Cerradas', variant: 'warning' },
  IN_PROGRESS: { label: 'En Curso', variant: 'default' },
  COMPLETED: { label: 'Completado', variant: 'outline' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
}

export type ShirtSize = 'SIZE_XS' | 'SIZE_S' | 'SIZE_M' | 'SIZE_L' | 'SIZE_XL' | 'SIZE_XXL'

export type Gender = 'FEMENIL' | 'VARONIL' | 'OTRO'

export type BloodType =
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE'

export interface ParticipantProfileResponse {
  id?: string
  shirtSize?: ShirtSize
  emergencyContactName?: string
  emergencyContactPhone?: string
  medicalConditions?: string
  bloodType?: BloodType
  phone?: string
  gender?: Gender
  createdAt?: string
  updatedAt?: string
}

export interface CreateParticipantProfileRequest {
  shirtSize: ShirtSize
  emergencyContactName: string
  emergencyContactPhone: string
  medicalConditions?: string
  bloodType: BloodType
  phone: string
  gender: Gender
}

export interface EventModalityResponse {
  id: string
  eventId: string
  name: string
  distance: number
  distanceUnit: 'KM' | 'MI'
  price: number
  capacity: number
  registeredCount: number
  availableSpots: number
}

export interface CreateModalityRequest {
  name: string
  distance: number
  distanceUnit: 'KM' | 'MI'
  price: number
  capacity: number
}

export interface ParticipantInEventResponse {
  registrationId: string
  participantId: string
  fullName: string | null
  email: string | null
  shirtSize: string | null
  bloodType: string | null
  medicalConditions?: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  status: string
  ticketCode: string
  bibNumber: number | null
  kitPickedUp: boolean
  kitPickedUpAt?: string | null
  registeredAt: string
}
