'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { events as eventsApi, registrations as registrationsApi, ApiError } from '@/lib/api'
import type { EventResponse, RegistrationResponse } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { CalendarDays, MapPin, Users, ChevronLeft } from 'lucide-react'

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
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(price)
}

const STATUS_MESSAGES: Record<string, string> = {
  DRAFT: 'Este evento aún no está publicado.',
  PUBLISHED: 'Las inscripciones aún no han abierto.',
  REGISTRATION_OPEN: '',
  REGISTRATION_CLOSED: 'Las inscripciones para este evento están cerradas.',
  IN_PROGRESS: 'Este evento ya está en curso.',
  COMPLETED: 'Este evento ha concluido.',
  CANCELLED: 'Este evento ha sido cancelado.',
}

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.eventId as string
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const [event, setEvent] = useState<EventResponse | null>(null)
  const [myRegistration, setMyRegistration] = useState<RegistrationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    eventsApi
      .get(eventId)
      .then(setEvent)
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? (err.detail || err.message)
            : 'Error al cargar el evento.'
        )
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
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/eventos" className="gap-1 flex items-center">
            <ChevronLeft className="h-4 w-4" />
            Volver a eventos
          </Link>
        </Button>
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error || 'Evento no encontrado.'}
        </div>
      </div>
    )
  }

  const isRegistrationOpen = event.status === 'REGISTRATION_OPEN'
  const hasSpots = (event.registrationsAvailable ?? 0) > 0 || event.registrationsAvailable === undefined
  const statusMessage = event.status ? STATUS_MESSAGES[event.status] : ''

  const registrationSection = () => {
    if (myRegistration) {
      return (
        <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950/20">
          <p className="font-medium text-green-700 dark:text-green-400">Ya estás inscrito en este evento</p>
          <Button variant="link" className="p-0 h-auto text-green-700 dark:text-green-400" asChild>
            <Link href="/mis-inscripciones">Ver mis inscripciones →</Link>
          </Button>
        </div>
      )
    }

    if (!isRegistrationOpen) {
      return (
        <div className="rounded-lg border bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            {statusMessage || 'Las inscripciones no están disponibles en este momento.'}
          </p>
        </div>
      )
    }

    if (!hasSpots) {
      return (
        <div className="rounded-lg border bg-muted p-4">
          <p className="text-sm text-muted-foreground">Sin lugares disponibles</p>
        </div>
      )
    }

    if (!isAuthenticated) {
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Inicia sesión para inscribirte a este evento.
          </p>
          <Button asChild>
            <Link href={`/login?redirect=${encodeURIComponent(`/eventos/${eventId}/inscribirse`)}`}>
              Iniciar sesión para inscribirme
            </Link>
          </Button>
        </div>
      )
    }

    return (
      <Button asChild size="lg">
        <Link href={`/eventos/${eventId}/inscribirse`}>
          Inscribirme
        </Link>
      </Button>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/eventos" className="gap-1 flex items-center">
          <ChevronLeft className="h-4 w-4" />
          Volver a eventos
        </Link>
      </Button>

      {event.coverImageUrl && (
        <div className="aspect-video max-h-64 overflow-hidden rounded-xl">
          <img
            src={event.coverImageUrl}
            alt={event.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div>
            <h1 className="text-3xl font-bold">{event.name}</h1>
            {event.status && (
              <Badge variant="outline" className="mt-2">
                {event.status.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>

          {event.description && (
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {event.eventDate && (
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(event.eventDate)}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {[event.location.place, event.location.city, event.location.country]
                    .filter(Boolean)
                    .join(', ') || event.location.fullAddress}
                </span>
              </div>
            )}
            {event.registrationsAvailable !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {event.registrationsAvailable} de {event.maxParticipants} lugares disponibles
                </span>
              </div>
            )}
            {event.Distance && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Distancia:</span>
                <span>{event.Distance}</span>
              </div>
            )}
          </div>

          {event.galleryImages && event.galleryImages.length > 0 && (
            <div>
              <h2 className="mb-3 font-semibold">Galería</h2>
              <div className="grid grid-cols-3 gap-2">
                {event.galleryImages.map((img) => (
                  <div key={img.id} className="aspect-square overflow-hidden rounded-md">
                    <img
                      src={img.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-4">
            <div>
              <p className="text-3xl font-bold">{formatPrice(event.price)}</p>
              {event.raceType && (
                <p className="text-sm text-muted-foreground capitalize">
                  {event.raceType.replace(/_/g, ' ').toLowerCase()}
                </p>
              )}
            </div>

            {event.organizer?.email && (
              <div className="text-sm">
                <span className="text-muted-foreground">Organizador: </span>
                <span>{event.organizer.email}</span>
              </div>
            )}

            <div className="pt-2 border-t">
              {registrationSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
