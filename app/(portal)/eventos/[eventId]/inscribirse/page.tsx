'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { events as eventsApi, profile as profileApi, registrations as registrationsApi, modalities as modalitiesApi, ApiError } from '@/lib/api'
import type { EventResponse, ParticipantProfileResponse, CreateParticipantProfileRequest, ShirtSize, BloodType, Gender, EventModalityResponse } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, ChevronLeft, ScrollText, X } from 'lucide-react'

type Step = 'profile' | 'modality' | 'confirm' | 'success'

const SHIRT_SIZE_OPTIONS: { value: ShirtSize; label: string }[] = [
  { value: 'SIZE_XS', label: 'XS' },
  { value: 'SIZE_S', label: 'S' },
  { value: 'SIZE_M', label: 'M' },
  { value: 'SIZE_L', label: 'L' },
  { value: 'SIZE_XL', label: 'XL' },
  { value: 'SIZE_XXL', label: 'XXL' },
]

const BLOOD_TYPE_OPTIONS: { value: BloodType; label: string }[] = [
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'A_NEGATIVE', label: 'A-' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'B_NEGATIVE', label: 'B-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'O_NEGATIVE', label: 'O-' },
]

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'FEMENIL', label: 'Femenil' },
  { value: 'VARONIL', label: 'Varonil' },
  { value: 'OTRO', label: 'Otro' },
]

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
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price)
}

function isProfileComplete(p: ParticipantProfileResponse): boolean {
  return !!(p.shirtSize && p.bloodType && p.emergencyContactName && p.emergencyContactPhone)
}

export default function InscribirsePage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const [step, setStep] = useState<Step>('profile')
  const [event, setEvent] = useState<EventResponse | null>(null)
  const [eventModalities, setEventModalities] = useState<EventModalityResponse[]>([])
  const [selectedModality, setSelectedModality] = useState<EventModalityResponse | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [ticketCode, setTicketCode] = useState<string>('')

  const [profileFormData, setProfileFormData] = useState<CreateParticipantProfileRequest>({
    shirtSize: 'SIZE_M',
    bloodType: 'O_POSITIVE',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    phone: '',
    gender: 'FEMENIL',
  })
  const [profileExists, setProfileExists] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [isRegistering, setIsRegistering] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)

  const [waiverRead, setWaiverRead] = useState(false)
  const [waiverAccepted, setWaiverAccepted] = useState(false)
  const [showWaiverModal, setShowWaiverModal] = useState(false)
  const [waiverAcceptedAtTime, setWaiverAcceptedAtTime] = useState<Date | null>(null)

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/eventos/${eventId}/inscribirse`)}`)
    }
  }, [isAuthenticated, isAuthLoading, router, eventId])

  useEffect(() => {
    if (!isAuthenticated) return

    Promise.all([
      eventsApi.get(eventId),
      modalitiesApi.list(eventId).catch(() => [] as EventModalityResponse[]),
      profileApi.getParticipant().catch((err) => {
        if (err instanceof ApiError && err.status === 404) return null
        throw err
      }),
    ])
      .then(([eventData, modalitiesData, profileData]) => {
        setEvent(eventData)
        setEventModalities(modalitiesData)
        if (!profileData || !isProfileComplete(profileData)) {
          if (profileData?.shirtSize) {
            setProfileExists(true)
            setProfileFormData({
              shirtSize: profileData.shirtSize,
              bloodType: profileData.bloodType ?? 'O_POSITIVE',
              emergencyContactName: profileData.emergencyContactName ?? '',
              emergencyContactPhone: profileData.emergencyContactPhone ?? '',
              medicalConditions: profileData.medicalConditions ?? '',
              phone: profileData.phone ?? '',
              gender: profileData.gender ?? 'FEMENIL',
            })
          }
          setShowProfileForm(true)
        } else if (modalitiesData.length > 0) {
          setStep('modality')
        } else {
          setStep('confirm')
        }
      })
      .catch((err) => {
        setProfileError(
          err instanceof ApiError ? (err.detail || err.message) : 'Error al cargar los datos.'
        )
      })
      .finally(() => setIsPageLoading(false))
  }, [isAuthenticated, eventId])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    setProfileError(null)
    try {
      const payload = { ...profileFormData, medicalConditions: profileFormData.medicalConditions || undefined }
      if (profileExists) {
        await profileApi.updateParticipant(payload)
      } else {
        await profileApi.createParticipant(payload)
      }
      setShowProfileForm(false)
      if (eventModalities.length > 0) {
        setStep('modality')
      } else {
        setStep('confirm')
      }
    } catch (err) {
      setProfileError(
        err instanceof ApiError ? (err.detail || err.message) : 'Error al guardar el perfil.'
      )
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSelectModality = (modality: EventModalityResponse) => {
    setSelectedModality(modality)
    setStep('confirm')
  }

  const handleRegister = async () => {
    setIsRegistering(true)
    setRegisterError(null)
    try {
      const reg = await registrationsApi.register(eventId, selectedModality?.id, true)
      setTicketCode(reg.ticketCode)
      setStep('success')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setRegisterError('Ya estás inscrito en este evento.')
        } else if (err.status === 422) {
          setRegisterError(
            err.detail || 'No es posible completar la inscripción. Verifica que el evento tenga cupo y las inscripciones estén abiertas.'
          )
        } else {
          setRegisterError(err.detail || err.message)
        }
      } else {
        setRegisterError('Error al procesar la inscripción. Intenta de nuevo.')
      }
    } finally {
      setIsRegistering(false)
    }
  }

  if (isAuthLoading || isPageLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  const hasModalities = eventModalities.length > 0

  const allSteps: { key: Step; label: string; number: number }[] = hasModalities
    ? [
        { key: 'profile', label: 'Perfil', number: 1 },
        { key: 'modality', label: 'Modalidad', number: 2 },
        { key: 'confirm', label: 'Confirmar', number: 3 },
        { key: 'success', label: 'Listo', number: 4 },
      ]
    : [
        { key: 'profile', label: 'Perfil', number: 1 },
        { key: 'confirm', label: 'Confirmar', number: 2 },
        { key: 'success', label: 'Listo', number: 3 },
      ]

  const currentStepIndex = allSteps.findIndex((s) => s.key === step)

  const effectivePrice = selectedModality ? selectedModality.price : 0

  const participantFullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Participante'

  function renderWaiverContent(template: string, includeAcceptedAt: boolean): React.ReactNode {
    const vars: Record<string, string> = {
      participantFullName,
      eventName: event?.name ?? '',
      eventDate: event?.eventDate ? formatDate(event.eventDate) : '',
      ...(includeAcceptedAt && waiverAcceptedAtTime
        ? { waiverAcceptedAt: waiverAcceptedAtTime.toLocaleString('es-MX') }
        : {}),
    }

    const lines = template.split('\n')
    const visibleLines = includeAcceptedAt
      ? lines
      : lines.filter((line) => !line.includes('{waiverAcceptedAt}'))

    const processedText = visibleLines.join('\n')

    const regex = /\{(\w+)\}/g
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    regex.lastIndex = 0
    while ((match = regex.exec(processedText)) !== null) {
      const varName = match[1]
      if (match.index > lastIndex) {
        parts.push(processedText.slice(lastIndex, match.index))
      }
      if (varName in vars) {
        parts.push(<strong key={match.index}>{vars[varName]}</strong>)
      } else {
        parts.push(match[0])
      }
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < processedText.length) {
      parts.push(processedText.slice(lastIndex))
    }

    return parts
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/eventos/${eventId}`} className="gap-1 flex items-center">
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Inscripción</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {allSteps.map((s, idx) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                step === s.key
                  ? 'bg-primary text-primary-foreground'
                  : s.number < currentStepIndex + 1
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {s.number < currentStepIndex + 1 ? '✓' : s.number}
            </div>
            <span className="text-sm text-muted-foreground hidden sm:inline">{s.label}</span>
            {idx < allSteps.length - 1 && (
              <div className="h-px w-8 bg-muted" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Profile */}
      {step === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Perfil de participante</CardTitle>
            <CardDescription>
              {showProfileForm
                ? 'Completa tu perfil antes de continuar con la inscripción.'
                : 'Verificando tu perfil...'}
            </CardDescription>
          </CardHeader>
          {showProfileForm && (
            <CardContent>
              <form onSubmit={handleSaveProfile}>
                <FieldGroup>
                  {profileError && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      {profileError}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="shirtSize">Talla de playera *</FieldLabel>
                      <Select
                        value={profileFormData.shirtSize}
                        onValueChange={(v) => setProfileFormData({ ...profileFormData, shirtSize: v as ShirtSize })}
                        required
                      >
                        <SelectTrigger id="shirtSize">
                          <SelectValue placeholder="Selecciona tu talla" />
                        </SelectTrigger>
                        <SelectContent>
                          {SHIRT_SIZE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="bloodType">Tipo de sangre *</FieldLabel>
                      <Select
                        value={profileFormData.bloodType}
                        onValueChange={(v) => setProfileFormData({ ...profileFormData, bloodType: v as BloodType })}
                        required
                      >
                        <SelectTrigger id="bloodType">
                          <SelectValue placeholder="Selecciona tu tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="phone">Teléfono *</FieldLabel>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileFormData.phone}
                        onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                        placeholder="10 dígitos"
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="gender">Género *</FieldLabel>
                      <Select
                        value={profileFormData.gender}
                        onValueChange={(v) => setProfileFormData({ ...profileFormData, gender: v as Gender })}
                        required
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="emergencyName">Nombre del contacto de emergencia *</FieldLabel>
                    <Input
                      id="emergencyName"
                      value={profileFormData.emergencyContactName}
                      onChange={(e) => setProfileFormData({ ...profileFormData, emergencyContactName: e.target.value })}
                      placeholder="Nombre completo"
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="emergencyPhone">Teléfono del contacto de emergencia *</FieldLabel>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={profileFormData.emergencyContactPhone}
                      onChange={(e) => setProfileFormData({ ...profileFormData, emergencyContactPhone: e.target.value })}
                      placeholder="10 dígitos"
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="medicalConditions">Condiciones médicas</FieldLabel>
                    <Textarea
                      id="medicalConditions"
                      value={profileFormData.medicalConditions}
                      onChange={(e) => setProfileFormData({ ...profileFormData, medicalConditions: e.target.value })}
                      placeholder="Alergias, enfermedades, medicamentos... (opcional)"
                      rows={3}
                    />
                  </Field>

                  <Button type="submit" disabled={isSavingProfile}>
                    {isSavingProfile ? (
                      <>
                        <Spinner className="mr-2" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar y continuar'
                    )}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          )}
        </Card>
      )}

      {/* Step: Modality selection */}
      {step === 'modality' && (
        <Card>
          <CardHeader>
            <CardTitle>Elige tu modalidad</CardTitle>
            <CardDescription>Selecciona la distancia en la que deseas participar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {eventModalities.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectModality(m)}
                disabled={m.availableSpots === 0}
                className={`w-full rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5 ${
                  m.availableSpots === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {m.distance} {m.distanceUnit} · {m.availableSpots > 0 ? `${m.availableSpots} lugares disponibles` : 'Sin lugares'}
                    </p>
                  </div>
                  <p className="text-lg font-bold shrink-0">{formatPrice(m.price)}</p>
                </div>
              </button>
            ))}
            <Button variant="ghost" className="w-full" onClick={() => setStep('profile')}>
              Atrás
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Waiver Modal */}
      {showWaiverModal && event && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Deslinde de responsabilidad</h2>
              <button
                onClick={() => setShowWaiverModal(false)}
                className="rounded-sm opacity-70 hover:opacity-100"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                {renderWaiverContent(event.waiverTemplate ?? '', false)}
              </p>
            </div>
            <div className="border-t px-6 py-4">
              <Button
                className="w-full"
                onClick={() => {
                  const now = new Date()
                  setWaiverRead(true)
                  setWaiverAccepted(true)
                  setWaiverAcceptedAtTime(now)
                  setShowWaiverModal(false)
                }}
              >
                He leído y acepto
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Confirm */}
      {step === 'confirm' && event && (
        <Card>
          <CardHeader>
            <CardTitle>Confirmar inscripción</CardTitle>
            <CardDescription>Revisa los detalles antes de confirmar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
              <p className="font-semibold text-lg">{event.name}</p>
              <p className="text-sm text-muted-foreground">{formatDate(event.eventDate)}</p>
              {event.location && (
                <p className="text-sm text-muted-foreground">
                  {[event.location.city, event.location.country].filter(Boolean).join(', ')}
                </p>
              )}
              {selectedModality && (
                <div className="mt-2 rounded-md bg-primary/10 p-2">
                  <p className="text-sm font-medium">Modalidad: {selectedModality.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedModality.distance} {selectedModality.distanceUnit}</p>
                </div>
              )}
              <p className="text-xl font-bold mt-2">{formatPrice(effectivePrice)}</p>
            </div>

            {/* Waiver section */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Carta responsiva</p>
                  <p className="text-xs text-muted-foreground">Lee el deslinde de responsabilidad antes de continuar.</p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 gap-1" onClick={() => setShowWaiverModal(true)}>
                  <ScrollText className="h-4 w-4" />
                  {waiverRead ? 'Ver de nuevo' : 'Leer carta'}
                </Button>
              </div>
              <label className={`flex cursor-pointer items-start gap-3 ${!waiverRead ? 'opacity-40' : ''}`}>
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border accent-primary"
                  disabled={!waiverRead}
                  checked={waiverAccepted}
                  onChange={(e) => setWaiverAccepted(e.target.checked)}
                />
                <span className="text-sm">
                  Acepto el deslinde de responsabilidad descrito en la carta.
                </span>
              </label>
              {waiverAccepted && waiverAcceptedAtTime && (
                <p className="text-xs text-muted-foreground">
                  Fecha y hora de aceptación:{' '}
                  <strong>{waiverAcceptedAtTime.toLocaleString('es-MX')}</strong>
                </p>
              )}
            </div>

            {registerError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {registerError}
              </div>
            )}

            {hasModalities && (
              <Button variant="outline" className="w-full" onClick={() => setStep('modality')}>
                Cambiar modalidad
              </Button>
            )}

            {effectivePrice > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Este evento tiene un costo de <strong>{formatPrice(effectivePrice)}</strong>.
                  El pago en línea estará disponible próximamente.
                </p>
                <Button disabled className="w-full">
                  Proceder al pago (próximamente)
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={handleRegister}
                disabled={isRegistering || !waiverAccepted}
              >
                {isRegistering ? (
                  <>
                    <Spinner className="mr-2" />
                    Procesando...
                  </>
                ) : (
                  'Confirmar inscripción gratuita'
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step: Success */}
      {step === 'success' && event && (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <div>
              <h2 className="text-2xl font-bold">¡Inscripción exitosa!</h2>
              <p className="text-muted-foreground mt-1">Ya estás registrado en este evento.</p>
            </div>

            <div className="rounded-lg border bg-muted/40 p-4 w-full space-y-2 text-left">
              <p className="font-semibold">{event.name}</p>
              <p className="text-sm text-muted-foreground">{formatDate(event.eventDate)}</p>
              {selectedModality && (
                <p className="text-sm text-muted-foreground">Modalidad: {selectedModality.name}</p>
              )}
              <p className="text-xs text-muted-foreground font-mono">
                Folio: {ticketCode}
              </p>
            </div>

            <Button asChild className="w-full">
              <Link href="/mis-inscripciones">Ver mis inscripciones</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
