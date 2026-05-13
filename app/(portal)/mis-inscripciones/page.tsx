'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { registrations as registrationsApi, ApiError } from '@/lib/api'
import type { RegistrationResponse } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
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
import { CalendarDays, Ticket, Search, Download, Mail, Trophy, CheckCircle2, Clock, XCircle } from 'lucide-react'

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
    CONFIRMED: {
      label: 'Confirmado',
      className: 'bg-green-100 text-green-700 border border-green-200',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    PENDING_PAYMENT: {
      label: 'Pago pendiente',
      className: 'bg-amber-100 text-amber-700 border border-amber-200',
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    CANCELLED: {
      label: 'Cancelado',
      className: 'bg-gray-100 text-gray-500 border border-gray-200',
      icon: <XCircle className="h-3.5 w-3.5" />,
    },
  }
  const { label, className, icon } = config[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {icon}
      {label}
    </span>
  )
}

export default function MisInscripcionesPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const [registrations, setRegistrations] = useState<RegistrationResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [resending, setResending] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState<string | null>(null)
  const [resendError, setResendError] = useState<string | null>(null)

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

  const handleDownloadTicket = async (registrationId: string) => {
    setDownloading(registrationId)
    setDownloadError(null)
    try {
      await registrationsApi.downloadTicket(registrationId)
    } catch (err) {
      setDownloadError(
        err instanceof ApiError
          ? (err.detail || err.message)
          : 'Error al descargar el boleto.'
      )
    } finally {
      setDownloading(null)
    }
  }

  const handleResendTicket = async (registrationId: string) => {
    setResending(registrationId)
    setResendSuccess(null)
    setResendError(null)
    try {
      await registrationsApi.resendTicket(registrationId)
      setResendSuccess(registrationId)
      setTimeout(() => setResendSuccess(null), 5000)
    } catch (err) {
      setResendError(
        err instanceof ApiError
          ? (err.detail || err.message)
          : 'Error al enviar el boleto.'
      )
    } finally {
      setResending(null)
    }
  }

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
        <Spinner className="h-8 w-8 text-amber-500" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-barlow-condensed text-4xl font-extrabold uppercase tracking-tight text-gray-900">
          Mis inscripciones
        </h1>
        <p className="mt-1 font-medium text-gray-500">
          {registrations.length > 0
            ? `${registrations.length} carrera${registrations.length !== 1 ? 's' : ''} registrada${registrations.length !== 1 ? 's' : ''}`
            : 'Tus carreras registradas aparecerán aquí'}
        </p>
      </div>

      {cancelError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {cancelError}
        </div>
      )}
      {downloadError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {downloadError}
        </div>
      )}
      {resendError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {resendError}
        </div>
      )}

      {registrations.length === 0 ? (
        <div className="flex h-72 flex-col items-center justify-center gap-5 rounded-2xl bg-white shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
            <Trophy className="h-10 w-10 text-amber-400" />
          </div>
          <div className="text-center">
            <p className="font-barlow-condensed text-2xl font-bold uppercase text-gray-800">
              ¡Listo para correr!
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Aún no tienes inscripciones. Explora los eventos disponibles y únete a una carrera.
            </p>
          </div>
          <Button asChild className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
            <Link href="/eventos" className="flex items-center">
              <Search className="h-4 w-4" />
              Explorar eventos
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {registrations.map((reg) => {
            const canCancel = reg.status === 'CONFIRMED' && reg.eventDate != null && isFutureDate(reg.eventDate)
            const isCancelling = cancelling === reg.id
            const isConfirmed = reg.status === 'CONFIRMED'
            const isDownloading = downloading === reg.id
            const isResending = resending === reg.id
            const resendSent = resendSuccess === reg.id
            const isCancelled = reg.status === 'CANCELLED'

            return (
              <div
                key={reg.id}
                className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ${isCancelled ? 'opacity-60' : ''}`}
              >
                {/* Color stripe by status */}
                <div className={`h-1.5 ${isConfirmed ? 'bg-green-400' : reg.status === 'PENDING_PAYMENT' ? 'bg-amber-400' : 'bg-gray-300'}`} />

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="font-barlow-condensed text-lg font-bold uppercase leading-tight text-gray-900">
                      {reg.eventName ?? reg.eventId}
                    </h3>
                    <StatusBadge status={reg.status} />
                  </div>

                  {reg.eventDate && (
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                      <CalendarDays className="h-4 w-4 shrink-0 text-amber-500" />
                      <span>{formatDate(reg.eventDate)}</span>
                    </div>
                  )}

                  <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
                    <Ticket className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-mono font-medium">{reg.ticketCode}</span>
                  </div>

                  {isConfirmed && (
                    <div className="mt-auto flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                        disabled={isDownloading}
                        onClick={() => handleDownloadTicket(reg.id)}
                      >
                        {isDownloading ? (
                          <><Spinner className="mr-1" />Generando...</>
                        ) : (
                          <><Download className="h-4 w-4" />Descargar boleto PDF</>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full gap-2 text-gray-600 hover:text-gray-900"
                        disabled={isResending}
                        onClick={() => handleResendTicket(reg.id)}
                      >
                        {isResending ? (
                          <><Spinner className="mr-1" />Enviando...</>
                        ) : (
                          <><Mail className="h-4 w-4" />Reenviar por correo</>
                        )}
                      </Button>
                      {resendSent && (
                        <p className="text-center text-xs font-medium text-green-600">
                          Boleto enviado a tu correo
                        </p>
                      )}
                    </div>
                  )}

                  {canCancel && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-red-500 hover:bg-red-50 hover:text-red-600"
                            disabled={isCancelling}
                          >
                            {isCancelling ? (
                              <><Spinner className="mr-2" />Cancelando...</>
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
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
