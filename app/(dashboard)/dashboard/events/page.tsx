'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { events as eventsApi } from '@/lib/api'
import type { EventSummaryResponse } from '@/lib/types'
import { EVENT_STATUS_LABELS } from '@/lib/types'
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Users,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function EventsPage() {
  const [events, setEvents] = useState<EventSummaryResponse[]>([])
  const [filteredEvents, setFilteredEvents] = useState<EventSummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      try {
        const status = statusFilter !== 'all' ? statusFilter : undefined
        const data = await eventsApi.list(status)
        setEvents(data)
        setFilteredEvents(data)
      } catch (error) {
        console.log('[v0] Error fetching events:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [statusFilter])

  useEffect(() => {
    let result = events

    if (searchQuery) {
      result = result.filter(
        (event) =>
          event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredEvents(result)
  }, [searchQuery, events])

  const getStatusBadge = (status?: string) => {
    const statusInfo = EVENT_STATUS_LABELS[status || 'DRAFT']
    const colorClasses = {
      success: 'bg-success/10 text-success',
      destructive: 'bg-destructive/10 text-destructive',
      secondary: 'bg-secondary text-secondary-foreground',
      warning: 'bg-warning/10 text-warning',
      default: 'bg-primary/10 text-primary',
      outline: 'bg-muted text-muted-foreground',
    }
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          colorClasses[statusInfo.variant] || colorClasses.default
        }`}
      >
        {statusInfo.label}
      </span>
    )
  }

  return (
    <DashboardLayout title="Mis Eventos" description="Gestiona todos tus eventos deportivos">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Lista de Eventos</CardTitle>
          <Button asChild>
            <Link href="/dashboard/events/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Evento
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos los estados</option>
              <option value="DRAFT">Borrador</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="REGISTRATION_OPEN">Inscripciones Abiertas</option>
              <option value="REGISTRATION_CLOSED">Inscripciones Cerradas</option>
              <option value="IN_PROGRESS">En Curso</option>
              <option value="COMPLETED">Completado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="h-8 w-8" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No se encontraron eventos</EmptyTitle>
                <EmptyDescription>
                  {events.length === 0
                    ? 'Crea tu primer evento para comenzar'
                    : 'Intenta ajustar los filtros de búsqueda'}
                </EmptyDescription>
              </EmptyHeader>
              {events.length === 0 && (
                <Button asChild className="mt-4">
                  <Link href="/dashboard/events/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Evento
                  </Link>
                </Button>
              )}
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Precio desde</TableHead>
                    <TableHead>Plazas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/events/${event.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {event.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {event.eventDate
                            ? format(new Date(event.eventDate), "d MMM yyyy", { locale: es })
                            : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {event.location || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.minPrice !== undefined
                          ? event.minPrice === 0
                            ? 'Gratis'
                            : `$${event.minPrice.toFixed(2)}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {event.totalAvailableSpots ?? '-'}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/events/${event.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalles
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/events/${event.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancelar evento
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
