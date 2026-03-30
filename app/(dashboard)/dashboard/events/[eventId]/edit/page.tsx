'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { events as eventsApi, ApiError } from '@/lib/api'
import type { UpdateEventRequest, EventResponse, EventImageResponse } from '@/lib/types'
import { RACE_TYPES } from '@/lib/types'
import { ArrowLeft, Activity, Calendar, MapPin, Users, DollarSign, ImageIcon, X } from 'lucide-react'

type GalleryItem = { file: File; preview: string }

function toDatetimeLocalValue(iso?: string): string {
  if (!iso) return ''
  return iso.slice(0, 16)
}

// The API returns raceType as a display label (e.g. "10K"), but the PATCH endpoint expects the enum key (e.g. "TEN_KM")
const DISPLAY_TO_ENUM = Object.fromEntries(
  Object.entries(RACE_TYPES).map(([key, label]) => [label, key])
) as Record<string, UpdateEventRequest['raceType']>

function toRaceTypeEnum(value?: string): UpdateEventRequest['raceType'] {
  if (!value) return undefined
  // Already an enum key
  if (value in RACE_TYPES) return value as UpdateEventRequest['raceType']
  // Display label → enum key
  return DISPLAY_TO_ENUM[value]
}

export default function EditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const router = useRouter()

  const [event, setEvent] = useState<EventResponse | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState<UpdateEventRequest>({})

  // Cover image
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null)
  const [newCoverPreview, setNewCoverPreview] = useState<string | null>(null)

  // Gallery
  const [existingImages, setExistingImages] = useState<EventImageResponse[]>([])
  const [removedImageIds, setRemovedImageIds] = useState<Set<string>>(new Set())
  const [newGalleryItems, setNewGalleryItems] = useState<GalleryItem[]>([])

  useEffect(() => {
    eventsApi.get(eventId)
      .then((data) => {
        setEvent(data)
        setExistingImages(data.galleryImages ?? [])
        setFormData({
          name: data.name,
          description: data.description,
          eventDate: toDatetimeLocalValue(data.eventDate),
          place: data.location?.place,
          city: data.location?.city,
          country: data.location?.country,
          latitude: data.location?.latitude,
          longitude: data.location?.longitude,
          raceType: toRaceTypeEnum(data.raceType),
          price: data.price,
          registrationStartDate: toDatetimeLocalValue(data.registrationPeriod?.start),
          registrationEndDate: toDatetimeLocalValue(data.registrationPeriod?.end),
          maxParticipants: data.maxParticipants,
        })
      })
      .catch((err) => {
        setLoadError(err instanceof ApiError ? (err.detail || err.message) : 'Error al cargar el evento.')
      })
  }, [eventId])

  const update = (field: keyof UpdateEventRequest, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveError(null)
    try {
      await eventsApi.update(eventId, formData)

      if (newCoverFile) {
        await eventsApi.uploadCoverImage(eventId, newCoverFile)
      }

      for (const imageId of removedImageIds) {
        await eventsApi.removeGalleryImage(eventId, imageId)
      }

      for (const item of newGalleryItems) {
        await eventsApi.addGalleryImage(eventId, item.file)
      }

      router.push(`/dashboard/events/${eventId}`)
    } catch (err) {
      setSaveError(err instanceof ApiError ? (err.detail || err.message) : 'Error al guardar los cambios.')
    } finally {
      setIsSaving(false)
    }
  }

  const markImageForRemoval = (imageId: string) => {
    setRemovedImageIds((prev) => new Set(prev).add(imageId))
  }

  const unmarkImageForRemoval = (imageId: string) => {
    setRemovedImageIds((prev) => {
      const next = new Set(prev)
      next.delete(imageId)
      return next
    })
  }

  if (loadError) {
    return (
      <DashboardLayout title="Editar Evento" description="">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{loadError}</div>
          <Button variant="ghost" asChild className="mt-4">
            <Link href="/dashboard/events"><ArrowLeft className="mr-2 h-4 w-4" />Volver</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  if (!event) {
    return (
      <DashboardLayout title="Editar Evento" description="">
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Editar Evento" description={`Modificando: ${event.name}`}>
      <div className="mx-auto max-w-3xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/dashboard/events/${eventId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al evento
          </Link>
        </Button>

        {saveError && (
          <div className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

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
                  <FieldLabel htmlFor="name">Nombre del Evento</FieldLabel>
                  <Input
                    id="name"
                    value={formData.name ?? ''}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Maratón Ciudad 2026"
                    minLength={5}
                    maxLength={200}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="description">Descripción</FieldLabel>
                  <Textarea
                    id="description"
                    value={formData.description ?? ''}
                    onChange={(e) => update('description', e.target.value)}
                    placeholder="Describe tu evento: recorrido, categorías, premios..."
                    rows={4}
                    maxLength={2000}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="raceType">Tipo de Carrera</FieldLabel>
                    <select
                      id="raceType"
                      value={formData.raceType ?? ''}
                      onChange={(e) => update('raceType', e.target.value as UpdateEventRequest['raceType'])}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
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
                      <FieldLabel htmlFor="distance">Distancia</FieldLabel>
                      <Input
                        id="distance"
                        type="number"
                        value={formData.distance ?? ''}
                        onChange={(e) => update('distance', e.target.value ? parseFloat(e.target.value) : undefined)}
                        min={0.01}
                        max={300}
                        step={0.01}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="distanceUnit">Unidad</FieldLabel>
                      <select
                        id="distanceUnit"
                        value={formData.distanceUnit ?? 'KM'}
                        onChange={(e) => update('distanceUnit', e.target.value as 'KM' | 'MI')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
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
                  <FieldLabel htmlFor="eventDate">Fecha y Hora del Evento</FieldLabel>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    value={formData.eventDate ?? ''}
                    onChange={(e) => update('eventDate', e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="place">
                    <MapPin className="mr-2 inline h-4 w-4" />
                    Lugar
                  </FieldLabel>
                  <Input
                    id="place"
                    value={formData.place ?? ''}
                    onChange={(e) => update('place', e.target.value)}
                    placeholder="Parque Central, Avenida Principal..."
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="city">Ciudad</FieldLabel>
                    <Input
                      id="city"
                      value={formData.city ?? ''}
                      onChange={(e) => update('city', e.target.value)}
                      placeholder="Ciudad de México"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="country">País</FieldLabel>
                    <Input
                      id="country"
                      value={formData.country ?? ''}
                      onChange={(e) => update('country', e.target.value)}
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
                      value={formData.latitude ?? ''}
                      onChange={(e) => update('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
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
                      value={formData.longitude ?? ''}
                      onChange={(e) => update('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
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
              <CardDescription>Periodo de registro y costos</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="registrationStartDate">Inicio de Inscripciones</FieldLabel>
                    <Input
                      id="registrationStartDate"
                      type="datetime-local"
                      value={formData.registrationStartDate ?? ''}
                      onChange={(e) => update('registrationStartDate', e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="registrationEndDate">Fin de Inscripciones</FieldLabel>
                    <Input
                      id="registrationEndDate"
                      type="datetime-local"
                      value={formData.registrationEndDate ?? ''}
                      onChange={(e) => update('registrationEndDate', e.target.value)}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="price">
                      <DollarSign className="mr-2 inline h-4 w-4" />
                      Precio de Inscripción
                    </FieldLabel>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price ?? ''}
                      onChange={(e) => update('price', e.target.value ? parseFloat(e.target.value) : undefined)}
                      min={0}
                      step={0.01}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="maxParticipants">Máximo de Participantes</FieldLabel>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants ?? ''}
                      onChange={(e) => update('maxParticipants', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Sin límite"
                      min={1}
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Imagen de Portada
              </CardTitle>
              <CardDescription>
                {event.coverImageUrl
                  ? 'Sube una nueva imagen para reemplazar la actual'
                  : 'Imagen principal que representa tu evento (opcional)'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.coverImageUrl && !newCoverFile && (
                <div className="flex items-center gap-4">
                  <img
                    src={event.coverImageUrl}
                    alt="Portada actual"
                    className="h-24 w-24 rounded-md object-cover"
                  />
                  <p className="text-sm text-muted-foreground">Portada actual</p>
                </div>
              )}
              <div className="h-48">
                <ImageDropzone
                  preview={newCoverPreview}
                  onChange={(file) => { setNewCoverFile(file); setNewCoverPreview(URL.createObjectURL(file)) }}
                  onRemove={() => { setNewCoverFile(null); setNewCoverPreview(null) }}
                  disabled={isSaving}
                  className="h-48"
                />
              </div>
            </CardContent>
          </Card>

          {/* Gallery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Galería de Imágenes
              </CardTitle>
              <CardDescription>Fotos adicionales del evento o recorrido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {existingImages.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Imágenes actuales</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {existingImages.map((img) => {
                      const isMarked = removedImageIds.has(img.id!)
                      return (
                        <div key={img.id} className="relative">
                          <img
                            src={img.imageUrl}
                            alt=""
                            className={`h-24 w-full rounded-md object-cover transition-opacity ${isMarked ? 'opacity-30' : ''}`}
                          />
                          <button
                            type="button"
                            onClick={() => isMarked ? unmarkImageForRemoval(img.id!) : markImageForRemoval(img.id!)}
                            className={`absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold shadow ${
                              isMarked
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-destructive text-destructive-foreground'
                            }`}
                            title={isMarked ? 'Deshacer' : 'Eliminar'}
                          >
                            {isMarked ? '↩' : <X className="h-3 w-3" />}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  {removedImageIds.size > 0 && (
                    <p className="mt-2 text-xs text-destructive">
                      {removedImageIds.size} imagen{removedImageIds.size !== 1 ? 'es' : ''} marcada{removedImageIds.size !== 1 ? 's' : ''} para eliminar
                    </p>
                  )}
                </div>
              )}

              <div>
                {existingImages.length > 0 && (
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Agregar imágenes</p>
                )}
                <ImageDropzone
                  multiple
                  items={newGalleryItems}
                  onAdd={(files) =>
                    setNewGalleryItems((prev) => [
                      ...prev,
                      ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) })),
                    ])
                  }
                  onRemove={(index) => setNewGalleryItems((prev) => prev.filter((_, i) => i !== index))}
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between pb-8">
            <Button type="button" variant="outline" asChild disabled={isSaving}>
              <Link href={`/dashboard/events/${eventId}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <><Spinner className="mr-2" /> Guardando...</>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
