'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { profile as profileApi, ApiError } from '@/lib/api'
import type { CreateParticipantProfileRequest, ShirtSize, BloodType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Save, UserCircle } from 'lucide-react'

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

const EMPTY_FORM: CreateParticipantProfileRequest = {
  shirtSize: 'SIZE_M',
  bloodType: 'O_POSITIVE',
  emergencyContactName: '',
  emergencyContactPhone: '',
  medicalConditions: '',
}

export default function PerfilPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [formData, setFormData] = useState<CreateParticipantProfileRequest>(EMPTY_FORM)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login?redirect=/perfil')
    }
  }, [isAuthenticated, isAuthLoading, router])

  useEffect(() => {
    if (!isAuthenticated) return
    profileApi
      .getParticipant()
      .then((data) => {
        if (data.shirtSize && data.bloodType) {
          setFormData({
            shirtSize: data.shirtSize,
            bloodType: data.bloodType,
            emergencyContactName: data.emergencyContactName || '',
            emergencyContactPhone: data.emergencyContactPhone || '',
            medicalConditions: data.medicalConditions || '',
          })
        }
      })
      .catch((err) => {
        // 404 significa que el perfil no existe aún — no es un error
        if (!(err instanceof ApiError && err.status === 404)) {
          setErrorMessage(
            err instanceof ApiError
              ? (err.detail || err.message)
              : 'Error al cargar el perfil.'
          )
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMessage(null)
    setErrorMessage(null)
    try {
      await profileApi.createParticipant({
        ...formData,
        medicalConditions: formData.medicalConditions || undefined,
      })
      setSuccessMessage('Perfil guardado correctamente.')
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError
          ? (err.detail || err.message)
          : 'Error al guardar el perfil.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Perfil de participante
          </CardTitle>
          <CardDescription>
            Esta información es necesaria para inscribirte a una carrera
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {successMessage && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="shirtSize">Talla de playera *</FieldLabel>
                  <Select
                    value={formData.shirtSize}
                    onValueChange={(value) =>
                      setFormData({ ...formData, shirtSize: value as ShirtSize })
                    }
                    required
                  >
                    <SelectTrigger id="shirtSize">
                      <SelectValue placeholder="Selecciona tu talla" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIRT_SIZE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="bloodType">Tipo de sangre *</FieldLabel>
                  <Select
                    value={formData.bloodType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, bloodType: value as BloodType })
                    }
                    required
                  >
                    <SelectTrigger id="bloodType">
                      <SelectValue placeholder="Selecciona tu tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="medicalConditions">Condiciones médicas</FieldLabel>
                <Textarea
                  id="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={(e) =>
                    setFormData({ ...formData, medicalConditions: e.target.value })
                  }
                  placeholder="Alergias, enfermedades, medicamentos actuales... (opcional)"
                  rows={3}
                  maxLength={500}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="emergencyContactName">
                  Nombre del contacto de emergencia *
                </FieldLabel>
                <Input
                  id="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyContactName: e.target.value })
                  }
                  placeholder="Nombre completo"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="emergencyContactPhone">
                  Teléfono del contacto de emergencia *
                </FieldLabel>
                <Input
                  id="emergencyContactPhone"
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyContactPhone: e.target.value })
                  }
                  placeholder="10 dígitos"
                  required
                />
              </Field>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Spinner className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar perfil
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
