'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { events } from '@/lib/api'
import type { EventSummaryResponse } from '@/lib/types'
import { EVENT_STATUS_LABELS } from '@/lib/types'
import { Calendar, Users, TrendingUp, PlusCircle, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DashboardPage() {
  const [myEvents, setMyEvents] = useState<EventSummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await events.listMyEvents()
        setMyEvents(data)
      } catch (error) {
        console.log('[v0] Error fetching events:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const stats = {
    totalEvents: myEvents.length,
    activeEvents: myEvents.filter(e => e.status === 'OPEN_REGISTRATION' || e.status === 'PUBLISHED').length,
    totalRegistrations: myEvents.reduce((acc, e) => acc + (e.totalAvailableSpots || 0), 0),
    upcomingEvents: myEvents.filter(e => e.eventDate && new Date(e.eventDate) > new Date()).length,
  }

  const recentEvents = myEvents.slice(0, 5)

  return (
    <DashboardLayout title="Dashboard" description="Resumen de tus eventos deportivos">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Eventos
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              eventos creados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Eventos Activos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground">
              con inscripciones abiertas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plazas Disponibles
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              en total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Próximos Eventos
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              por celebrar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events & Quick Actions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Eventos Recientes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/events">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-muted-foreground">Cargando eventos...</p>
              </div>
            ) : recentEvents.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">No tienes eventos aún</p>
                <Button size="sm" asChild>
                  <Link href="/dashboard/events/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear evento
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event) => {
                  const statusInfo = EVENT_STATUS_LABELS[event.status || 'DRAFT']
                  return (
                    <Link
                      key={event.id}
                      href={`/dashboard/events/${event.id}`}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{event.name}</h3>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{event.location}</span>
                          {event.eventDate && (
                            <span>
                              {format(new Date(event.eventDate), "d 'de' MMMM, yyyy", { locale: es })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {event.minPrice !== undefined && (
                          <span className="text-sm font-medium">
                            {event.minPrice === 0 ? 'Gratis' : `Desde $${event.minPrice.toFixed(2)}`}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            statusInfo.variant === 'success'
                              ? 'bg-success/10 text-success'
                              : statusInfo.variant === 'destructive'
                              ? 'bg-destructive/10 text-destructive'
                              : statusInfo.variant === 'secondary'
                              ? 'bg-secondary text-secondary-foreground'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" asChild>
              <Link href="/dashboard/events/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear nuevo evento
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/events">
                <Calendar className="mr-2 h-4 w-4" />
                Ver mis eventos
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/settings">
                <Users className="mr-2 h-4 w-4" />
                Perfil de organizador
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
