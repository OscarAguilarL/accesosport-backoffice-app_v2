'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { events as eventsApi, ApiError } from '@/lib/api'
import type { EventSummaryResponse } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { CalendarDays, MapPin, Trophy, SlidersHorizontal, X } from 'lucide-react'

function formatDateShort(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatPrice(price?: number): string {
  if (price === undefined || price === null) return ''
  if (price === 0) return 'Gratis'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(price)
}

function EventCard({ event }: { event: EventSummaryResponse }) {
  const isSoldOut = event.totalAvailableSpots === 0
  const isLastSpots =
    event.totalAvailableSpots !== undefined &&
    event.totalAvailableSpots > 0 &&
    event.totalAvailableSpots <= 15

  return (
    <Link
      href={`/eventos/${event.id}`}
      className="group relative flex aspect-[4/3] overflow-hidden rounded-2xl bg-amber-100 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Background */}
      {event.coverImageUrl ? (
        <img
          src={event.coverImageUrl}
          alt={event.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

      {/* Sold out overlay */}
      {isSoldOut && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <span className="font-barlow-condensed rounded-lg border-2 border-white/60 px-5 py-2 text-2xl font-extrabold uppercase tracking-widest text-white/80">
            Agotado
          </span>
        </div>
      )}

      {/* Badges */}
      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
        {event.minPrice !== undefined && (
          <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-black shadow">
            {formatPrice(event.minPrice)}
          </span>
        )}
        {isLastSpots && (
          <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white shadow">
            ¡Últimos lugares!
          </span>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-barlow-condensed text-xl font-bold uppercase leading-tight text-white drop-shadow-sm">
          {event.name}
        </h3>
        <div className="mt-2 space-y-1">
          {event.eventDate && (
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span className="capitalize">{formatDateShort(event.eventDate)}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          Ver carrera →
        </div>
      </div>
    </Link>
  )
}

export default function EventosPage() {
  const [eventList, setEventList] = useState<EventSummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    eventsApi
      .listAvailable()
      .then(setEventList)
      .catch((err) => {
        setError(
          err instanceof ApiError ? (err.detail || err.message) : 'Error al cargar los eventos.'
        )
      })
      .finally(() => setIsLoading(false))
  }, [])

  const filteredEvents = useMemo(() => {
    return eventList.filter((event) => {
      if (dateFrom && event.eventDate && new Date(event.eventDate) < new Date(dateFrom)) return false
      if (dateTo && event.eventDate && new Date(event.eventDate) > new Date(dateTo + 'T23:59:59')) return false
      return true
    })
  }, [eventList, dateFrom, dateTo])

  const hasActiveFilters = dateFrom || dateTo

  const clearFilters = () => {
    setDateFrom('')
    setDateTo('')
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8 text-amber-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}
          </p>
          <h1 className="font-barlow-condensed text-4xl font-extrabold uppercase text-gray-900 sm:text-5xl">
            Carreras disponibles
          </h1>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
            hasActiveFilters
              ? 'border-amber-400 bg-amber-50 text-amber-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtrar
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-black">
              !
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">Filtrar por fecha</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700"
              >
                <X className="h-3.5 w-3.5" />
                Limpiar
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Desde</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border-amber-200 bg-amber-50/50 focus:border-amber-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Hasta</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border-amber-200 bg-amber-50/50 focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Events grid */}
      {filteredEvents.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl bg-white shadow-sm">
          <Trophy className="h-14 w-14 text-amber-300" />
          <div className="text-center">
            <p className="font-barlow-condensed text-2xl font-bold uppercase text-gray-800">
              {eventList.length > 0 ? 'Sin resultados' : '¡Próximamente!'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {eventList.length > 0
                ? 'Prueba ajustando los filtros de fecha.'
                : 'Estamos preparando nuevas carreras. Vuelve pronto.'}
            </p>
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="border-amber-300 text-amber-700 hover:bg-amber-50">
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
