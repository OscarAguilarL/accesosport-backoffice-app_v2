'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { events as eventsApi, registrations as registrationsApi } from '@/lib/api'
import type { EventResponse, ParticipantInEventResponse } from '@/lib/types'
import { EVENT_STATUS_LABELS, RACE_TYPES } from '@/lib/types'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Pencil,
  Globe,
  Play,
  XCircle,
  CheckCircle,
  Image as ImageIcon,
  Clock,
  Download,
  ScanLine,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const PARTICIPANTS_STATUSES = new Set(['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED'])

const REGISTRATION_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pago pendiente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
}

function exportToCSV(participants: ParticipantInEventResponse[], eventName: string) {
  const headers = ['Nombre', 'Email', 'Talla', 'Sangre', 'Contacto emergencia', 'Tel. emergencia', 'Estado']
  const rows = participants.map(p => [
    p.fullName, p.email, p.shirtSize, p.bloodType,
    p.emergencyContactName, p.emergencyContactPhone, p.status
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `inscritos-${eventName}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const router = useRouter()
  const [event, setEvent] = useState<EventResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [participants, setParticipants] = useState<ParticipantInEventResponse[]>([])
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await eventsApi.get(eventId)
        setEvent(data)
        if (data.status && PARTICIPANTS_STATUSES.has(data.status)) {
          setIsLoadingParticipants(true)
          try {
            const list = await registrationsApi.getByEvent(eventId)
            setParticipants(list)
          } catch (error) {
            console.log('[v0] Error fetching participants:', error)
          } finally {
            setIsLoadingParticipants(false)
          }
        }
      } catch (error) {
        console.log('[v0] Error fetching event:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvent()
  }, [eventId])

  const handlePublish = async () => {
    if (!event?.id) return
    setIsActionLoading(true)
    try {
      const updated = await eventsApi.publish(event.id)
      setEvent(updated)
    } catch (error) {
      console.log('[v0] Error publishing event:', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleOpenRegistration = async () => {
    if (!event?.id) return
    setIsActionLoading(true)
    try {
      const updated = await eventsApi.openRegistration(event.id)
      setEvent(updated)
    } catch (error) {
      console.log('[v0] Error opening registration:', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!event?.id) return
    setIsActionLoading(true)
    try {
      const updated = await eventsApi.complete(event.id)
      setEvent(updated)
    } catch (error) {
      console.log('[v0] Error completing event:', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!event?.id) return
    setIsActionLoading(true)
    try {
      await eventsApi.cancel(event.id)
      router.push('/dashboard/events')
    } catch (error) {
      console.log('[v0] Error cancelling event:', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Cargando..." description="">
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </DashboardLayout>
    )
  }

  if (!event) {
    return (
      <DashboardLayout title="Evento no encontrado" description="">
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <p className="text-muted-foreground">El evento que buscas no existe o fue eliminado.</p>
          <Button asChild>
            <Link href="/dashboard/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a eventos
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const statusInfo = EVENT_STATUS_LABELS[event.status || 'DRAFT']
  const raceTypeLabel = RACE_TYPES[event.raceType as keyof typeof RACE_TYPES] || event.raceType

  return (
    <DashboardLayout title={event.name || 'Detalle del Evento'} description="">
      {/* Header Actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a eventos
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          {event.status === 'DRAFT' && (
            <Button onClick={handlePublish} disabled={isActionLoading}>
              <Globe className="mr-2 h-4 w-4" />
              Publicar
            </Button>
          )}
          {event.status === 'PUBLISHED' && (
            <Button onClick={handleOpenRegistration} disabled={isActionLoading}>
              <Play className="mr-2 h-4 w-4" />
              Abrir Inscripciones
            </Button>
          )}
          {(event.status === 'REGISTRATION_CLOSED' || event.status === 'IN_PROGRESS') && (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/events/${eventId}/checkin`}>
                <ScanLine className="mr-2 h-4 w-4" />
                Check-in de kits
              </Link>
            </Button>
          )}
          {event.status === 'IN_PROGRESS' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isActionLoading}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Completar Evento
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Completar este evento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    El evento será marcado como completado. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, volver</AlertDialogCancel>
                  <AlertDialogAction onClick={handleComplete}>
                    Sí, completar evento
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="outline" asChild>
            <Link href={`/dashboard/events/${eventId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isActionLoading}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar Evento
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Cancelar este evento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El evento será cancelado y los participantes serán notificados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, volver</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel}>
                  Sí, cancelar evento
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="mb-6 flex items-start gap-4">
        <div className="w-40 h-40 shrink-0 overflow-hidden rounded-xl border bg-muted shadow-sm">
          {event.coverImageUrl ? (
            <img
              src={event.coverImageUrl}
              alt={event.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 pt-1">
          <span
            className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
          <h1 className="text-xl font-bold leading-tight">{event.name}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {event.eventDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(event.eventDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
              </span>
            )}
            {event.location?.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {[event.location.city, event.location.country].filter(Boolean).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Descripción</h3>
                <p className="mt-1 text-foreground">
                  {event.description || 'Sin descripción'}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha del evento</p>
                    <p className="text-foreground">
                      {event.eventDate
                        ? format(new Date(event.eventDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
                        : '-'}
                    </p>
                    {event.eventDate && (
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.eventDate), 'HH:mm', { locale: es })} hrs
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
                    <p className="text-foreground">{event.location?.place || '-'}</p>
                    <p className="text-sm text-muted-foreground">
                      {[event.location?.city, event.location?.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de carrera</p>
                  <p className="text-foreground">{raceTypeLabel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Distancia</p>
                  <p className="text-foreground">{event.Distance || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Precio</p>
                  <p className="text-foreground">
                    {event.price !== undefined ? `$${event.price.toFixed(2)}` : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Period */}
          <Card>
            <CardHeader>
              <CardTitle>Periodo de Inscripción</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Inicio</p>
                    <p className="font-medium">
                      {event.registrationPeriod?.start
                        ? format(new Date(event.registrationPeriod.start), "d MMM yyyy, HH:mm", { locale: es })
                        : '-'}
                    </p>
                  </div>
                </div>
                <div className="h-px flex-1 bg-border" />
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fin</p>
                    <p className="font-medium">
                      {event.registrationPeriod?.end
                        ? format(new Date(event.registrationPeriod.end), "d MMM yyyy, HH:mm", { locale: es })
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gallery */}
          {event.galleryImages && event.galleryImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Galería</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {event.galleryImages.map((image) => (
                    <img
                      key={image.id}
                      src={image.imageUrl}
                      alt="Event gallery"
                      className="aspect-video rounded-lg object-cover"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Participantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Inscritos</span>
                <span className="text-xl font-bold">{event.registeredParticipants || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Máximo</span>
                <span className="text-xl font-bold">{event.maxParticipants || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Disponibles</span>
                <span className="text-xl font-bold text-primary">
                  {event.registrationsAvailable ?? '-'}
                </span>
              </div>
              {event.maxParticipants && event.registeredParticipants !== undefined && (
                <div className="mt-4">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${Math.min(
                          (event.registeredParticipants / event.maxParticipants) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    {Math.round((event.registeredParticipants / event.maxParticipants) * 100)}% ocupado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organizador</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{event.organizer?.email || 'Sin información'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fechas del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creado</span>
                <span>
                  {event.createdAt
                    ? format(new Date(event.createdAt), 'd MMM yyyy', { locale: es })
                    : '-'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Participants Section */}
      {event.status && PARTICIPANTS_STATUSES.has(event.status) && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participantes inscritos
                    <span className="text-sm font-normal text-muted-foreground">
                      {participants.length} / {event.maxParticipants ?? '∞'}
                    </span>
                  </CardTitle>
                </div>
                {participants.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(participants, event.name ?? 'evento')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingParticipants ? (
                <div className="flex h-32 items-center justify-center">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : participants.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Users />
                    </EmptyMedia>
                    <EmptyTitle>Sin inscritos</EmptyTitle>
                    <EmptyDescription>Aún no hay participantes inscritos en este evento.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre completo</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Talla</TableHead>
                      <TableHead>Grupo sanguíneo</TableHead>
                      <TableHead>Contacto de emergencia</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha de inscripción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((p) => (
                      <TableRow key={p.registrationId}>
                        <TableCell className="font-medium">{p.fullName}</TableCell>
                        <TableCell>{p.email}</TableCell>
                        <TableCell>{p.shirtSize}</TableCell>
                        <TableCell>{p.bloodType}</TableCell>
                        <TableCell>
                          {p.emergencyContactName} — {p.emergencyContactPhone}
                        </TableCell>
                        <TableCell>
                          <span className={
                            p.status === 'CONFIRMED'
                              ? 'text-success font-medium'
                              : p.status === 'CANCELLED'
                              ? 'text-destructive font-medium'
                              : 'text-muted-foreground'
                          }>
                            {REGISTRATION_STATUS_LABELS[p.status] ?? p.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(p.registeredAt), "d MMM yyyy, HH:mm", { locale: es })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
