'use client'

import { useEffect, useState } from 'react'
import { events as eventsApi, ApiError } from '@/lib/api'
import type { EventSummaryResponse } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { CalendarDays, MapPin, Users } from 'lucide-react'

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

export default function EventosPage() {
  const [eventList, setEventList] = useState<EventSummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    eventsApi
      .listAvailable()
      .then(setEventList)
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? (err.detail || err.message)
            : 'Error al cargar los eventos.'
        )
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (eventList.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-lg font-medium">No hay eventos disponibles</p>
        <p className="text-sm">Vuelve pronto para ver nuevas carreras.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Eventos disponibles</h1>
        <p className="text-muted-foreground">Encuentra tu próxima carrera</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {eventList.map((event) => (
          <Card key={event.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">{event.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 flex-shrink-0" />
                <span>{formatDate(event.eventDate)}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
              )}
              {event.registrationsAvailable !== undefined && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span>{event.registrationsAvailable} lugares disponibles</span>
                </div>
              )}
              <div className="mt-auto pt-2">
                <span className="text-lg font-semibold">
                  {formatPrice(event.price)}
                </span>
                {event.distance && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    · {event.distance}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
