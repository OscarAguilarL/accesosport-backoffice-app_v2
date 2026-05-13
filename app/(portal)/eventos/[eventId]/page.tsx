'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  events as eventsApi,
  registrations as registrationsApi,
  modalities as modalitiesApi,
  ApiError,
} from '@/lib/api'
import type { EventResponse, RegistrationResponse, EventModalityResponse } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  CalendarDays,
  MapPin,
  Users,
  ChevronLeft,
  Trophy,
  CheckCircle2,
  LogIn,
  Ruler,
  Clock,
} from 'lucide-react'

function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatPrice(price?: number): string {
  if (price === undefined || price === null) return '-'
  if (price === 0) return 'Gratis'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price)
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  REGISTRATION_OPEN: 'Inscripciones abiertas',
  REGISTRATION_CLOSED: 'Inscripciones cerradas',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Finalizado',
  CANCELLED: 'Cancelado',
}

const STATUS_MESSAGES: Record<string, string> = {
  DRAFT: 'Este evento aún no está publicado.',
  PUBLISHED: 'Las inscripciones aún no han abierto.',
  REGISTRATION_OPEN: '',
  REGISTRATION_CLOSED: 'Las inscripciones están cerradas.',
  IN_PROGRESS: 'Este evento ya está en curso.',
  COMPLETED: 'Este evento ha concluido.',
  CANCELLED: 'Este evento ha sido cancelado.',
}

function RegistrationCTA({
  event,
  modalities,
  myRegistration,
  isAuthenticated,
  eventId,
  compact = false,
}: {
  event: EventResponse
  modalities: EventModalityResponse[]
  myRegistration: RegistrationResponse | null
  isAuthenticated: boolean
  eventId: string
  compact?: boolean
}) {
  const isOpen = event.status === 'REGISTRATION_OPEN'
  const totalSpots = modalities.reduce((s, m) => s + m.availableSpots, 0)
  const hasSpots = modalities.length === 0 || totalSpots > 0
  const hasModalities = modalities.length > 0
  const minPrice = hasModalities ? Math.min(...modalities.map((m) => m.price)) : undefined

  if (myRegistration) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          <div>
            <p className="font-semibold text-green-800">¡Ya estás inscrito!</p>
            <p className="text-xs text-green-700 font-mono">{myRegistration.ticketCode}</p>
          </div>
        </div>
        <Button variant="outline" asChild className="w-full border-green-200 text-green-700 hover:bg-green-50">
          <Link href="/mis-inscripciones">Ver mis inscripciones →</Link>
        </Button>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-600">
          {STATUS_MESSAGES[event.status ?? ''] || 'Inscripciones no disponibles.'}
        </p>
      </div>
    )
  }

  if (!hasSpots && hasModalities) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm font-medium text-gray-600">Sin lugares disponibles</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        {!compact && (
          <p className="text-center text-sm text-gray-500">
            Inicia sesión para inscribirte
          </p>
        )}
        <Button
          asChild
          size="lg"
          className="w-full gap-2 bg-blue-600 font-bold text-white hover:bg-blue-700"
        >
          <Link href={`/login?redirect=${encodeURIComponent(`/eventos/${eventId}/inscribirse`)}`}>
            <LogIn className="h-4 w-4" />
            {compact
              ? `Iniciar sesión${minPrice !== undefined ? ` · ${formatPrice(minPrice)}` : ''}`
              : 'Iniciar sesión para inscribirme'}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <Button
      asChild
      size="lg"
      className="font-barlow-condensed w-full bg-blue-600 text-lg font-bold uppercase tracking-wider text-white hover:bg-blue-700 active:scale-[0.98] transition-transform"
    >
      <Link href={`/eventos/${eventId}/inscribirse`}>
        {compact && minPrice !== undefined
          ? `¡Inscribirme · ${formatPrice(minPrice)}!`
          : '¡Inscribirme ahora!'}
      </Link>
    </Button>
  )
}

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.eventId as string
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const [event, setEvent] = useState<EventResponse | null>(null)
  const [modalities, setModalities] = useState<EventModalityResponse[]>([])
  const [myRegistration, setMyRegistration] = useState<RegistrationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      eventsApi.get(eventId),
      modalitiesApi.list(eventId).catch(() => [] as EventModalityResponse[]),
    ])
      .then(([eventData, modalitiesData]) => {
        setEvent(eventData)
        setModalities(modalitiesData)
      })
      .catch((err) => {
        setError(err instanceof ApiError ? (err.detail || err.message) : 'Error al cargar el evento.')
      })
      .finally(() => setIsLoading(false))
  }, [eventId])

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      registrationsApi
        .getMyRegistrations()
        .then((regs) => {
          const found = regs.find((r) => r.eventId === eventId && r.status !== 'CANCELLED')
          setMyRegistration(found ?? null)
        })
        .catch(() => {})
    }
  }, [isAuthenticated, isAuthLoading, eventId])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8 text-amber-500" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/eventos" className="flex items-center gap-1 text-gray-600">
            <ChevronLeft className="h-4 w-4" /> Volver a eventos
          </Link>
        </Button>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || 'Evento no encontrado.'}
        </div>
      </div>
    )
  }

  const hasModalities = modalities.length > 0
  const totalSpots = modalities.reduce((s, m) => s + m.availableSpots, 0)
  const minPrice = hasModalities ? Math.min(...modalities.map((m) => m.price)) : undefined
  const isOpen = event.status === 'REGISTRATION_OPEN'
  const showStickyMobileCTA = isOpen && !myRegistration

  return (
    <div className="pb-24 lg:pb-0">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/eventos" className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" /> Volver a eventos
        </Link>
      </Button>

      {/* Hero cover — full bleed */}
      <div className="-mx-4 relative mb-8 h-64 overflow-hidden sm:h-80 md:h-96 md:rounded-2xl">
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt={event.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500">
            <div className="flex h-full items-center justify-center">
              <Trophy className="h-24 w-24 text-black/15" />
            </div>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/5" />

        {/* Overlay content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6">
          {/* Status badge */}
          {event.status && (
            <span
              className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-bold shadow ${
                event.status === 'REGISTRATION_OPEN'
                  ? 'bg-green-500 text-white'
                  : 'bg-white/90 text-gray-800'
              }`}
            >
              {STATUS_LABELS[event.status] ?? event.status}
            </span>
          )}
          <h1 className="font-barlow-condensed text-4xl font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow sm:text-5xl">
            {event.name}
          </h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/85">
            {event.eventDate && (
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span className="capitalize">{formatDate(event.eventDate)}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>
                  {[event.location.place, event.location.city, event.location.country]
                    .filter(Boolean)
                    .join(', ') || event.location.fullAddress}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          {/* Key stats row */}
          {(hasModalities || event.eventDate) && (
            <div className="flex flex-wrap gap-4 rounded-2xl bg-white p-5 shadow-sm">
              {event.eventDate && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Fecha</p>
                    <p className="text-sm font-semibold capitalize text-gray-900">
                      {formatDate(event.eventDate)}
                    </p>
                  </div>
                </div>
              )}
              {hasModalities && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Lugares</p>
                    <p className="text-sm font-semibold text-gray-900">{totalSpots} disponibles</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="font-barlow-condensed mb-3 text-xl font-bold uppercase tracking-wide text-gray-800">
                Acerca del evento
              </h2>
              <p className="leading-relaxed text-gray-600">{event.description}</p>
            </div>
          )}

          {/* Modalities */}
          {hasModalities && (
            <div>
              <h2 className="font-barlow-condensed mb-3 text-2xl font-bold uppercase tracking-wide text-gray-900">
                Modalidades
              </h2>
              <div className="space-y-3">
                {modalities.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-amber-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                        <Ruler className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{m.name}</p>
                        <p className="text-sm text-gray-500">
                          {m.distance} {m.distanceUnit} ·{' '}
                          <span className={m.availableSpots === 0 ? 'text-red-500' : 'text-gray-500'}>
                            {m.availableSpots === 0 ? 'Sin lugares' : `${m.availableSpots} lugares`}
                          </span>
                        </p>
                      </div>
                    </div>
                    <p className="font-barlow-condensed shrink-0 text-2xl font-bold text-gray-900">
                      {formatPrice(m.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {event.galleryImages && event.galleryImages.length > 0 && (
            <div>
              <h2 className="font-barlow-condensed mb-3 text-2xl font-bold uppercase tracking-wide text-gray-900">
                Galería
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {event.galleryImages.map((img) => (
                  <div key={img.id} className="aspect-square overflow-hidden rounded-xl">
                    <img
                      src={img.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — desktop */}
        <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-md">
            {minPrice !== undefined && (
              <div className="border-b border-gray-100 pb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Precio desde</p>
                <p className="font-barlow-condensed mt-1 text-5xl font-extrabold text-gray-900">
                  {formatPrice(minPrice)}
                </p>
                {hasModalities && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {modalities.length} modalidad{modalities.length !== 1 ? 'es' : ''}
                  </p>
                )}
              </div>
            )}

            {event.organizer?.email && (
              <div className="border-b border-gray-100 pb-4 text-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Organizador</p>
                <p className="mt-1 text-gray-700">{event.organizer.email}</p>
              </div>
            )}

            <RegistrationCTA
              event={event}
              modalities={modalities}
              myRegistration={myRegistration}
              isAuthenticated={isAuthenticated}
              eventId={eventId}
            />
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      {showStickyMobileCTA && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-sm lg:hidden">
          <RegistrationCTA
            event={event}
            modalities={modalities}
            myRegistration={myRegistration}
            isAuthenticated={isAuthenticated}
            eventId={eventId}
            compact
          />
        </div>
      )}
    </div>
  )
}
