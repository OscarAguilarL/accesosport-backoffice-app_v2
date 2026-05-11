'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { events as eventsApi, ApiError } from '@/lib/api'
import type { EventSummaryResponse } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { CalendarDays, MapPin, Users, ArrowRight } from 'lucide-react'

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

  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

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

  const filteredEvents = useMemo(() => {
    return eventList.filter((event) => {
      if (dateFrom && event.eventDate) {
        if (new Date(event.eventDate) < new Date(dateFrom)) return false
      }
      if (dateTo && event.eventDate) {
        if (new Date(event.eventDate) > new Date(dateTo + 'T23:59:59')) return false
      }
      return true
    })
  }, [eventList, dateFrom, dateTo])

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Eventos disponibles</h1>
        <p className="text-muted-foreground">Encuentra tu próxima carrera</p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Fecha desde</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Fecha hasta</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
          <p className="text-lg font-medium">No hay eventos disponibles</p>
          <p className="text-sm">
            {eventList.length > 0
              ? 'Prueba ajustando los filtros.'
              : 'Vuelve pronto para ver nuevas carreras.'}
          </p>
          {eventList.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDateFrom('')
                setDateTo('')
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="flex flex-col hover:shadow-md transition-shadow">
              {event.coverImageUrl && (
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={event.coverImageUrl}
                    alt={event.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
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
                {event.totalAvailableSpots !== undefined && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span>{event.totalAvailableSpots} lugares disponibles</span>
                  </div>
                )}
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div>
                    <span className="text-lg font-semibold">
                      {formatPrice(event.minPrice)}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/eventos/${event.id}`} className="gap-1 flex items-center">
                      Ver detalle
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
