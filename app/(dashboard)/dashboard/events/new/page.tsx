'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { events as eventsApi, ApiError } from '@/lib/api'
import type { CreateEventRequest, CreateModalityRequest } from '@/lib/types'
import { ArrowLeft, Calendar, MapPin, Users, Activity, ImageIcon, Plus, Trash2 } from 'lucide-react'
import { ImageDropzone } from '@/components/ui/image-dropzone'

const STEPS = [
  { title: 'Información Básica',  description: 'Nombre y descripción del evento' },
  { title: 'Fecha y Ubicación',   description: 'Cuándo y dónde se realizará' },
  { title: 'Inscripciones',       description: 'Período de inscripción' },
  { title: 'Modalidades',         description: 'Distancias, precios y cupos' },
  { title: 'Imágenes',            description: 'Portada y galería del evento' },
]

type ModalityDraft = CreateModalityRequest & { _id: string }

const emptyModality = (): ModalityDraft => ({
  _id: crypto.randomUUID(),
  name: '',
  distance: 0,
  distanceUnit: 'KM',
  price: 0,
  priceWithoutShirt: null,
  capacity: 0,
})

type GalleryItem = { file: File; preview: string }

export default function CreateEventPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdEventId, setCreatedEventId] = useState<string | null>(null)

  const [basicInfo, setBasicInfo] = useState({ name: '', description: '' })
  const [location, setLocation] = useState({ eventDate: '', place: '', city: '', country: '', latitude: '', longitude: '' })
  const [registration, setRegistration] = useState({ registrationStartDate: '', registrationEndDate: '' })
  const [modalities, setModalities] = useState<ModalityDraft[]>([emptyModality()])

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])

  const addModality = () => setModalities(prev => [...prev, emptyModality()])

  const removeModality = (id: string) =>
    setModalities(prev => prev.filter(m => m._id !== id))

  const updateModality = (id: string, field: keyof CreateModalityRequest, value: string | number) =>
    setModalities(prev => prev.map(m => m._id === id ? { ...m, [field]: value } : m))

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStep(s => s + 1)
  }

  const handleBack = () => {
    setError(null)
    setStep(s => s - 1)
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (modalities.some(m => !m.name.trim() || m.distance <= 0 || m.capacity <= 0)) {
      setError('Completa todos los campos de cada modalidad (nombre, distancia y cupo son obligatorios).')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const payload: CreateEventRequest = {
        name: basicInfo.name,
        description: basicInfo.description || undefined,
        eventDate: location.eventDate,
        place: location.place,
        city: location.city || undefined,
        country: location.country || undefined,
        latitude: location.latitude ? parseFloat(location.latitude) : undefined,
        longitude: location.longitude ? parseFloat(location.longitude) : undefined,
        registrationStartDate: registration.registrationStartDate,
        registrationEndDate: registration.registrationEndDate,
        modalities: modalities.map(({ _id, ...m }) => m),
      }
      const event = await eventsApi.create(payload)
      setCreatedEventId(event.id!)
      setStep(4)
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail || err.message) : 'Error al crear el evento.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImagesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createdEventId) return
    setIsLoading(true)
    setError(null)
    try {
      if (coverFile) await eventsApi.uploadCoverImage(createdEventId, coverFile)
      for (const item of galleryItems) await eventsApi.addGalleryImage(createdEventId, item.file)
      router.push(`/dashboard/events/${createdEventId}`)
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail || err.message) : 'Error al subir las imágenes.')
    } finally {
      setIsLoading(false)
    }
  }

  const totalImages = (coverFile ? 1 : 0) + galleryItems.length

  return (
    <DashboardLayout title="Crear Nuevo Evento" description="Configura los detalles de tu evento deportivo">
      <div className="mx-auto max-w-3xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a eventos
          </Link>
        </Button>

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                i < step ? 'bg-primary text-primary-foreground'
                  : i === step ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 transition-colors ${i < step ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
        )}

        {/* Step 0: Basic Info */}
        {step === 0 && (
          <form onSubmit={handleNext}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {STEPS[0].title}
                </CardTitle>
                <CardDescription>{STEPS[0].description}</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nombre del Evento *</FieldLabel>
                    <Input
                      id="name"
                      value={basicInfo.name}
                      onChange={e => setBasicInfo(p => ({ ...p, name: e.target.value }))}
                      placeholder="Maratón Ciudad 2026"
                      required minLength={5} maxLength={200}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="description">Descripción</FieldLabel>
                    <Textarea
                      id="description"
                      value={basicInfo.description}
                      onChange={e => setBasicInfo(p => ({ ...p, description: e.target.value }))}
                      placeholder="Describe tu evento: recorrido, categorías, premios..."
                      rows={4} maxLength={2000}
                    />
                  </Field>
                  <div className="flex justify-end">
                    <Button type="submit">Continuar</Button>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          </form>
        )}

        {/* Step 1: Date & Location */}
        {step === 1 && (
          <form onSubmit={handleNext}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {STEPS[1].title}
                </CardTitle>
                <CardDescription>{STEPS[1].description}</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="eventDate">Fecha y Hora del Evento *</FieldLabel>
                    <Input
                      id="eventDate" type="datetime-local"
                      value={location.eventDate}
                      onChange={e => setLocation(p => ({ ...p, eventDate: e.target.value }))}
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
                      value={location.place}
                      onChange={e => setLocation(p => ({ ...p, place: e.target.value }))}
                      placeholder="Parque Central, Avenida Principal..."
                      required
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="city">Ciudad</FieldLabel>
                      <Input id="city" value={location.city}
                        onChange={e => setLocation(p => ({ ...p, city: e.target.value }))}
                        placeholder="Ciudad de México" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="country">País</FieldLabel>
                      <Input id="country" value={location.country}
                        onChange={e => setLocation(p => ({ ...p, country: e.target.value }))}
                        placeholder="México" />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="latitude">Latitud</FieldLabel>
                      <Input id="latitude" type="number" value={location.latitude}
                        onChange={e => setLocation(p => ({ ...p, latitude: e.target.value }))}
                        placeholder="19.4326" min={-90} max={90} step="any" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="longitude">Longitud</FieldLabel>
                      <Input id="longitude" type="number" value={location.longitude}
                        onChange={e => setLocation(p => ({ ...p, longitude: e.target.value }))}
                        placeholder="-99.1332" min={-180} max={180} step="any" />
                    </Field>
                  </div>
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handleBack}>Atrás</Button>
                    <Button type="submit">Continuar</Button>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          </form>
        )}

        {/* Step 2: Registration period */}
        {step === 2 && (
          <form onSubmit={handleNext}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {STEPS[2].title}
                </CardTitle>
                <CardDescription>{STEPS[2].description}</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="registrationStartDate">Inicio de Inscripciones *</FieldLabel>
                      <Input
                        id="registrationStartDate" type="datetime-local"
                        value={registration.registrationStartDate}
                        onChange={e => setRegistration(p => ({ ...p, registrationStartDate: e.target.value }))}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="registrationEndDate">Fin de Inscripciones *</FieldLabel>
                      <Input
                        id="registrationEndDate" type="datetime-local"
                        value={registration.registrationEndDate}
                        onChange={e => setRegistration(p => ({ ...p, registrationEndDate: e.target.value }))}
                        required
                      />
                    </Field>
                  </div>
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handleBack}>Atrás</Button>
                    <Button type="submit">Continuar</Button>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          </form>
        )}

        {/* Step 3: Modalities — creates the event on submit */}
        {step === 3 && (
          <form onSubmit={handleCreateEvent}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {STEPS[3].title}
                </CardTitle>
                <CardDescription>
                  Agrega las distancias disponibles. Cada modalidad tiene su propio precio y cupo de participantes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modalities.map((m, idx) => (
                    <div key={m._id} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Modalidad {idx + 1}</span>
                        {modalities.length > 1 && (
                          <Button
                            type="button" variant="ghost" size="sm"
                            onClick={() => removeModality(m._id)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <Field>
                        <FieldLabel htmlFor={`name-${m._id}`}>Nombre *</FieldLabel>
                        <Input
                          id={`name-${m._id}`}
                          value={m.name}
                          onChange={e => updateModality(m._id, 'name', e.target.value)}
                          placeholder="5K, 10K, Medio Maratón, Maratón..."
                          required
                        />
                      </Field>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <Field>
                          <FieldLabel htmlFor={`distance-${m._id}`}>Distancia *</FieldLabel>
                          <Input
                            id={`distance-${m._id}`}
                            type="number"
                            value={m.distance || ''}
                            onChange={e => updateModality(m._id, 'distance', parseFloat(e.target.value) || 0)}
                            placeholder="21.097"
                            min={0.01} max={300} step={0.001}
                            required
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor={`unit-${m._id}`}>Unidad *</FieldLabel>
                          <select
                            id={`unit-${m._id}`}
                            value={m.distanceUnit}
                            onChange={e => updateModality(m._id, 'distanceUnit', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="KM">KM</option>
                            <option value="MI">Millas</option>
                          </select>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor={`price-${m._id}`}>Precio ($) *</FieldLabel>
                          <Input
                            id={`price-${m._id}`}
                            type="number"
                            value={m.price}
                            onChange={e => updateModality(m._id, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            min={0} step={0.01}
                            required
                          />
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel htmlFor={`priceWithoutShirt-${m._id}`}>Precio sin playera ($)</FieldLabel>
                        <Input
                          id={`priceWithoutShirt-${m._id}`}
                          type="number"
                          value={m.priceWithoutShirt ?? ''}
                          onChange={e => updateModality(m._id, 'priceWithoutShirt', e.target.value ? parseFloat(e.target.value) : null as unknown as number)}
                          placeholder="Opcional — deja vacío si no aplica"
                          min={0} step={0.01}
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor={`capacity-${m._id}`}>Cupo de participantes *</FieldLabel>
                        <Input
                          id={`capacity-${m._id}`}
                          type="number"
                          value={m.capacity || ''}
                          onChange={e => updateModality(m._id, 'capacity', parseInt(e.target.value) || 0)}
                          placeholder="500"
                          min={1}
                          required
                        />
                      </Field>
                    </div>
                  ))}

                  <Button
                    type="button" variant="outline" className="w-full"
                    onClick={addModality}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar otra modalidad
                  </Button>

                  <div className="flex justify-between pt-2">
                    <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
                      Atrás
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <><Spinner className="mr-2" /> Creando evento...</>
                      ) : (
                        'Crear evento y continuar'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        )}

        {/* Step 4: Images */}
        {step === 4 && (
          <form onSubmit={handleImagesSubmit}>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Imagen de Portada
                  </CardTitle>
                  <CardDescription>Imagen principal del evento (opcional)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ImageDropzone
                      preview={coverPreview}
                      onChange={file => { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)) }}
                      onRemove={() => { setCoverFile(null); setCoverPreview(null) }}
                      disabled={isLoading}
                      className="h-48"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Galería de Imágenes
                  </CardTitle>
                  <CardDescription>Fotos adicionales del evento o recorrido (opcional)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageDropzone
                    multiple
                    items={galleryItems}
                    onAdd={files => setGalleryItems(prev => [...prev, ...files.map(f => ({ file: f, preview: URL.createObjectURL(f) }))])}
                    onRemove={i => setGalleryItems(prev => prev.filter((_, idx) => idx !== i))}
                    disabled={isLoading}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  type="button" variant="outline"
                  onClick={() => router.push(`/dashboard/events/${createdEventId}`)}
                  disabled={isLoading}
                >
                  Omitir y finalizar
                </Button>
                <Button type="submit" disabled={isLoading || totalImages === 0}>
                  {isLoading ? (
                    <><Spinner className="mr-2" /> Subiendo imágenes...</>
                  ) : (
                    `Subir ${totalImages} imagen${totalImages !== 1 ? 'es' : ''} y finalizar`
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  )
}
