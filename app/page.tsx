'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PortalLayout } from '@/components/portal/portal-layout'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { events as eventsApi } from '@/lib/api'
import type { EventSummaryResponse } from '@/lib/types'
import { MapPin, CalendarDays, ArrowRight, Trophy, Timer, Medal, ChevronRight } from 'lucide-react'

function formatDateShort(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-MX', {
    month: 'short',
    day: 'numeric',
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

function FeaturedEventCard({ event }: { event: EventSummaryResponse }) {
  return (
    <Link
      href={`/eventos/${event.id}`}
      className="group relative flex aspect-[3/4] overflow-hidden rounded-2xl bg-amber-100 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:aspect-[4/5]"
    >
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Price badge */}
      {event.minPrice !== undefined && (
        <div className="absolute right-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-black shadow">
          {formatPrice(event.minPrice)}
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="font-barlow-condensed text-xl font-bold uppercase leading-tight text-white drop-shadow-sm">
          {event.name}
        </h3>
        <div className="mt-2 flex flex-col gap-1">
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
        <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-amber-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Ver evento <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  )
}

export default function LandingPage() {
  const [featuredEvents, setFeaturedEvents] = useState<EventSummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    eventsApi
      .listAvailable()
      .then((data) => setFeaturedEvents(data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <PortalLayout>
      {/* Hero */}
      <section className="-mx-4 -mt-8 bg-amber-400 px-4 pb-20 pt-20 sm:pb-28 sm:pt-32">
        <div className="relative mx-auto max-w-5xl">
          {/* Decorative */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-64 w-64 rounded-full bg-black/5" />
          <div className="pointer-events-none absolute -bottom-4 left-1/3 h-40 w-40 rounded-full bg-white/10" />

          <p className="relative font-barlow text-sm font-bold uppercase tracking-widest text-amber-900">
            La plataforma de carreras atléticas
          </p>
          <h1 className="font-barlow-condensed relative mt-3 text-[clamp(3.5rem,10vw,6.5rem)] font-extrabold uppercase leading-none tracking-tight text-black">
            Corre.<br />Supérate.<br />Inscríbete.
          </h1>
          <p className="relative mt-6 max-w-lg font-barlow text-lg font-medium text-amber-950">
            Encuentra las mejores carreras atléticas de tu ciudad, inscríbete en segundos y recibe tu boleto al instante.
          </p>
          <div className="relative mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2 bg-black px-7 font-semibold text-white hover:bg-black/80">
              <Link href="/eventos">
                Ver todos los eventos
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-black/20 bg-white/40 font-semibold hover:bg-white/60"
            >
              <Link href="/signup">Crear cuenta gratis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured events */}
      <section className="py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Próximas carreras</p>
            <h2 className="font-barlow-condensed mt-1 text-4xl font-extrabold uppercase text-gray-900">
              Eventos disponibles
            </h2>
          </div>
          <Link
            href="/eventos"
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner className="h-8 w-8 text-amber-500" />
          </div>
        ) : featuredEvents.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl bg-white text-center shadow-sm">
            <Trophy className="h-10 w-10 text-amber-300" />
            <div>
              <p className="font-barlow-condensed text-xl font-bold uppercase text-gray-700">Próximamente</p>
              <p className="text-sm text-gray-500">Estamos preparando nuevas carreras</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((event) => (
              <FeaturedEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="-mx-4 bg-gray-900 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-amber-400">Simple y rápido</p>
          <h2 className="font-barlow-condensed mt-2 text-center text-4xl font-extrabold uppercase text-white sm:text-5xl">
            ¿Cómo funciona?
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {[
              {
                step: '01',
                icon: Trophy,
                title: 'Explora',
                desc: 'Navega por el catálogo de carreras disponibles en tu ciudad y filtra por fecha.',
              },
              {
                step: '02',
                icon: Timer,
                title: 'Inscríbete',
                desc: 'Elige tu modalidad, completa tu perfil de atleta y confirma en segundos.',
              },
              {
                step: '03',
                icon: Medal,
                title: 'Corre',
                desc: 'Recibe tu boleto PDF por correo y preséntate el día del evento.',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <span className="font-barlow-condensed text-7xl font-black leading-none text-amber-400">
                  {item.step}
                </span>
                <div className="mt-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <item.icon className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="font-barlow-condensed mt-3 text-2xl font-bold uppercase text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="-mx-4 bg-amber-400 px-4 py-16 text-center">
        <h2 className="font-barlow-condensed text-4xl font-extrabold uppercase text-black sm:text-5xl">
          ¿Listo para tu próxima carrera?
        </h2>
        <p className="mt-3 font-medium text-amber-900">
          Únete a miles de corredores que ya usan AccesoSport
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="gap-2 bg-black px-8 font-semibold text-white hover:bg-black/80">
            <Link href="/eventos">Explorar eventos</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-black/20 bg-white/40 font-semibold hover:bg-white/60"
          >
            <Link href="/signup">Registrarse gratis</Link>
          </Button>
        </div>
      </section>
    </PortalLayout>
  )
}
