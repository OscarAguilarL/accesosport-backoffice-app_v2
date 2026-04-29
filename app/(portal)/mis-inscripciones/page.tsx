'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { registrations as registrationsApi, ApiError } from '@/lib/api'
import type { RegistrationResponse } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { CalendarDays, Ticket, Search } from 'lucide-react'

function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function isFutureDate(dateString: string): boolean {
  return new Date(dateString) > new Date()
}

function StatusBadge({ status }: { status: RegistrationResponse['status'] }) {
  const config = {
    CONFIRMED: { label: 'Confirmado', className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' },
    PENDING_PAYMENT: { label: 'Pago pendiente', className: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' },
    CANCELLED: { label: 'Cancelado', className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400' },
  }
  const { label, className } = config[status]
  return <Badge className={className}>{label}</Badge>
}

export default function MisInscripcionesPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const [registrations, setRegistrations] = useState<RegistrationResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login?redirect=/mis-inscripciones')
    }
  }, [isAuthenticated, isAuthLoading, router])

  useEffect(() => {
    if (!isAuthenticated) return

    registrationsApi
      .getMyRegistrations()
      .then(setRegistrations)
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? (err.detail || err.message)
            : 'Error al cargar las inscripciones.'
        )
      })
      .finally(() => setIsLoading(false))
  }, [isAuthenticated])

  const handleCancel = async (registration: RegistrationResponse) => {
    setCancelling(registration.id)
    setCancelError(null)
    try {
      await registrationsApi.cancel(registration.eventId, registration.id)
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registration.id ? { ...r, status: 'CANCELLED' } : r
        )
      )
    } catch (err) {
      setCancelError(
        err instanceof ApiError
          ? (err.detail || err.message)
          : 'Error al cancelar la inscripción.'
      )
    } finally {
      setCancelling(null)
    }
  }

  if (isAuthLoading || (isLoading && isAuthenticated)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!isAuthenticated) return null

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
        <h1 className="text-2xl font-bold">Mis inscripciones</h1>
        <p className="text-muted-foreground">Tus carreras registradas</p>
      </div>

      {cancelError && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {cancelError}
        </div>
      )}

      {registrations.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
          <Ticket className="h-12 w-12 opacity-40" />
          <div className="text-center">
            <p className="text-lg font-medium">No tienes inscripciones aún</p>
            <p className="text-sm">Explora los eventos disponibles y regístrate en uno.</p>
          </div>
          <Button asChild>
            <Link href="/eventos" className="gap-2 flex items-center">
              <Search className="h-4 w-4" />
              Explorar eventos
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {registrations.map((reg) => {
            const canCancel = reg.status === 'CONFIRMED' && reg.eventDate != null && isFutureDate(reg.eventDate)
            const isCancelling = cancelling === reg.id

            return (
              <Card key={reg.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">
                      {reg.eventName ?? reg.eventId}
                    </CardTitle>
                    <StatusBadge status={reg.status} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  {reg.eventDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4 flex-shrink-0" />
                      <span>{formatDate(reg.eventDate)}</span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground font-mono">
                    Folio: {reg.ticketCode}
                  </div>

                  {canCancel && (
                    <div className="mt-auto pt-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-destructive hover:text-destructive"
                            disabled={isCancelling}
                          >
                            {isCancelling ? (
                              <>
                                <Spinner className="mr-2" />
                                Cancelando...
                              </>
                            ) : (
                              'Cancelar inscripción'
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Cancelar inscripción?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Estás a punto de cancelar tu inscripción a{' '}
                              <strong>{reg.eventName}</strong>. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Mantener inscripción</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancel(reg)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Sí, cancelar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
