'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { events as eventsApi, ApiError } from '@/lib/api'
import type { CreateEventRequest } from '@/lib/types'
import { ArrowLeft, Calendar, MapPin, DollarSign, Users, Activity } from 'lucide-react'

export default function CreateEventPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateEventRequest>({
    name: '',
    description: '',
    eventDate: '',
    place: '',
    city: '',
    country: '',
    raceType: 'TEN_KM',
    distance: 10,
    distanceUnit: 'KM',
    price: 0,
    registrationStartDate: '',
    registrationEndDate: '',
    maxParticipants: undefined,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const event = await eventsApi.create(formData)
      router.push(`/dashboard/events/${event.id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message)
      } else {
        setError('Error al crear el evento. Por favor intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: keyof CreateEventRequest, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout title="Crear Nuevo Evento" description="Configura los detalles de tu evento deportivo">
      <div className="mx-auto max-w-3xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a eventos
          </Link>
        </Button>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Información Básica
                </CardTitle>
                <CardDescription>Datos generales del evento</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nombre del Evento *</FieldLabel>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      placeholder="Maratón Ciudad 2026"
                      required
                      minLength={5}
                      maxLength={200}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="description">Descripción</FieldLabel>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Describe tu evento: recorrido, categorías, premios..."
                      rows={4}
                      maxLength={2000}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="raceType">Tipo de Carrera *</FieldLabel>
                      <select
                        id="raceType"
                        value={formData.raceType}
                        onChange={(e) =>
                          updateFormData('raceType', e.target.value as CreateEventRequest['raceType'])
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                      >
                        <option value="MARATHON">Maratón</option>
                        <option value="HALF_MARATHON">Medio Maratón</option>
                        <option value="TEN_KM">10K</option>
                        <option value="FIVE_KM">5K</option>
                        <option value="OTHER">Otro</option>
                      </select>
                    </Field>

                    <div className="grid grid-cols-2 gap-2">
                      <Field>
                        <FieldLabel htmlFor="distance">Distancia *</FieldLabel>
                        <Input
                          id="distance"
                          type="number"
                          value={formData.distance}
                          onChange={(e) => updateFormData('distance', parseFloat(e.target.value))}
                          min={0.01}
                          max={300}
                          step={0.01}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="distanceUnit">Unidad *</FieldLabel>
                        <select
                          id="distanceUnit"
                          value={formData.distanceUnit}
                          onChange={(e) =>
                            updateFormData('distanceUnit', e.target.value as 'KM' | 'MI')
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                          required
                        >
                          <option value="KM">KM</option>
                          <option value="MI">Millas</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Date & Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Fecha y Ubicación
                </CardTitle>
                <CardDescription>Cuándo y dónde se realizará el evento</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="eventDate">Fecha y Hora del Evento *</FieldLabel>
                    <Input
                      id="eventDate"
                      type="datetime-local"
                      value={formData.eventDate}
                      onChange={(e) => updateFormData('eventDate', e.target.value)}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="place">
                      <MapPin className="mr-2 inline h-4 w-4" />
                      Lugar *
                    </FieldLabel>
                    <Input
                      id="place"
                      value={formData.place}
                      onChange={(e) => updateFormData('place', e.target.value)}
                      placeholder="Parque Central, Avenida Principal..."
                      required
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="city">Ciudad</FieldLabel>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        placeholder="Ciudad de México"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="country">País</FieldLabel>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => updateFormData('country', e.target.value)}
                        placeholder="México"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="latitude">Latitud</FieldLabel>
                      <Input
                        id="latitude"
                        type="number"
                        value={formData.latitude || ''}
                        onChange={(e) =>
                          updateFormData('latitude', e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                        placeholder="19.4326"
                        min={-90}
                        max={90}
                        step="any"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="longitude">Longitud</FieldLabel>
                      <Input
                        id="longitude"
                        type="number"
                        value={formData.longitude || ''}
                        onChange={(e) =>
                          updateFormData('longitude', e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                        placeholder="-99.1332"
                        min={-180}
                        max={180}
                        step="any"
                      />
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Registration & Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Inscripciones y Precio
                </CardTitle>
                <CardDescription>Configura el periodo de inscripción y costos</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="registrationStartDate">
                        Inicio de Inscripciones *
                      </FieldLabel>
                      <Input
                        id="registrationStartDate"
                        type="datetime-local"
                        value={formData.registrationStartDate}
                        onChange={(e) => updateFormData('registrationStartDate', e.target.value)}
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="registrationEndDate">
                        Fin de Inscripciones *
                      </FieldLabel>
                      <Input
                        id="registrationEndDate"
                        type="datetime-local"
                        value={formData.registrationEndDate}
                        onChange={(e) => updateFormData('registrationEndDate', e.target.value)}
                        required
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="price">
                        <DollarSign className="mr-2 inline h-4 w-4" />
                        Precio de Inscripción *
                      </FieldLabel>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => updateFormData('price', parseFloat(e.target.value))}
                        min={0}
                        step={0.01}
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="maxParticipants">
                        Máximo de Participantes
                      </FieldLabel>
                      <Input
                        id="maxParticipants"
                        type="number"
                        value={formData.maxParticipants || ''}
                        onChange={(e) =>
                          updateFormData(
                            'maxParticipants',
                            e.target.value ? parseInt(e.target.value) : undefined
                          )
                        }
                        placeholder="Sin límite"
                        min={1}
                      />
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/events">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Creando evento...
                  </>
                ) : (
                  'Crear Evento'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
