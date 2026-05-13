'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { events } from '@/lib/api'
import type { EventSummaryResponse } from '@/lib/types'
import { EVENT_STATUS_LABELS } from '@/lib/types'
import { Calendar, Users, TrendingUp, PlusCircle, ArrowRight, Clock, LayoutGrid } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Spinner } from '@/components/ui/spinner'

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
  bgClass,
}: {
  title: string
  value: number
  subtitle: string
  icon: React.ElementType
  iconClass: string
  bgClass: string
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bgClass}`}>
            <Icon className={`h-5 w-5 ${iconClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [myEvents, setMyEvents] = useState<EventSummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    events.listMyEvents()
      .then(setMyEvents)
      .catch((e) => console.log('[dashboard] Error fetching events:', e))
      .finally(() => setIsLoading(false))
  }, [])

  const stats = {
    totalEvents: myEvents.length,
    activeEvents: myEvents.filter(e => e.status === 'REGISTRATION_OPEN' || e.status === 'PUBLISHED').length,
    totalSpots: myEvents.reduce((acc, e) => acc + (e.totalAvailableSpots || 0), 0),
    upcomingEvents: myEvents.filter(e => e.eventDate && new Date(e.eventDate) > new Date()).length,
  }

  const recentEvents = myEvents.slice(0, 5)

  return (
    <DashboardLayout title="Dashboard" description="Resumen de tus eventos deportivos">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Eventos"
          value={stats.totalEvents}
          subtitle="eventos creados"
          icon={LayoutGrid}
          iconClass="text-blue-600"
          bgClass="bg-blue-100"
        />
        <StatCard
          title="Eventos Activos"
          value={stats.activeEvents}
          subtitle="con inscripciones abiertas"
          icon={TrendingUp}
          iconClass="text-emerald-600"
          bgClass="bg-emerald-100"
        />
        <StatCard
          title="Plazas Disponibles"
          value={stats.totalSpots}
          subtitle="en todos tus eventos"
          icon={Users}
          iconClass="text-violet-600"
          bgClass="bg-violet-100"
        />
        <StatCard
          title="Próximos Eventos"
          value={stats.upcomingEvents}
          subtitle="por celebrar"
          icon={Clock}
          iconClass="text-amber-600"
          bgClass="bg-amber-100"
        />
      </div>

      {/* Recent Events + Quick Actions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <CardTitle className="text-base font-semibold">Eventos Recientes</CardTitle>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground hover:text-foreground">
              <Link href="/dashboard/events">
                Ver todos
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Spinner className="h-6 w-6" />
              </div>
            ) : recentEvents.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-3 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground/40" />
                <div>
                  <p className="text-sm font-medium text-foreground">No tienes eventos aún</p>
                  <p className="text-xs text-muted-foreground">Crea tu primer evento para comenzar</p>
                </div>
                <Button size="sm" asChild>
                  <Link href="/dashboard/events/new">
                    <PlusCircle className="mr-2 h-3.5 w-3.5" />
                    Crear evento
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentEvents.map((event) => {
                  const statusInfo = EVENT_STATUS_LABELS[event.status || 'DRAFT']
                  const badgeColors: Record<string, string> = {
                    success: 'bg-emerald-100 text-emerald-700',
                    destructive: 'bg-red-100 text-red-700',
                    secondary: 'bg-slate-100 text-slate-600',
                    warning: 'bg-amber-100 text-amber-700',
                    default: 'bg-blue-100 text-blue-700',
                    outline: 'bg-slate-100 text-slate-500',
                  }
                  return (
                    <li key={event.id}>
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{event.name}</p>
                          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                            {event.location && <span className="truncate">{event.location}</span>}
                            {event.eventDate && (
                              <span className="shrink-0">
                                {format(new Date(event.eventDate), "d MMM yyyy", { locale: es })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          {event.minPrice !== undefined && (
                            <span className="text-sm font-semibold text-foreground">
                              {event.minPrice === 0 ? 'Gratis' : `$${event.minPrice.toFixed(0)}`}
                            </span>
                          )}
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColors[statusInfo.variant] ?? badgeColors.default}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <Button className="w-full justify-start gap-3" asChild>
              <Link href="/dashboard/events/new">
                <PlusCircle className="h-4 w-4" />
                Crear nuevo evento
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" asChild>
              <Link href="/dashboard/events">
                <Calendar className="h-4 w-4" />
                Ver mis eventos
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" asChild>
              <Link href="/dashboard/settings">
                <Users className="h-4 w-4" />
                Perfil de organizador
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
