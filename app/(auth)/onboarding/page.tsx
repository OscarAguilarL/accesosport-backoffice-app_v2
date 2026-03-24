'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { user as userApi, profile as profileApi, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { SavePersonalDataRequest, SaveUserAddressRequest, CreateOrganizerProfileRequest } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'

const STEPS = [
  { title: 'Información personal', description: 'Cuéntanos sobre ti' },
  { title: 'Dirección', description: 'Tu domicilio' },
  { title: 'Perfil de organizador', description: 'Información de tu organización' },
  { title: 'Logo', description: 'Sube el logo de tu organización' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const [personalData, setPersonalData] = useState<SavePersonalDataRequest>({
    firstName: '',
    lastName: '',
    secondLastName: '',
    birthDate: '',
    gender: '',
    phoneNumber: '',
  })

  const [address, setAddress] = useState<SaveUserAddressRequest>({
    street: '',
    externalNumber: '',
    internalNumber: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'México',
    zipCode: '',
  })

  const [organizerProfile, setOrganizerProfile] = useState<CreateOrganizerProfileRequest>({
    organizationName: '',
    website: '',
    facebook: '',
    instagram: '',
    description: '',
  })

  const handlePersonalDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await userApi.savePersonalData(personalData)
      setStep(1)
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail || err.message) : 'Error al guardar la información.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await userApi.saveAddress(address)
      setStep(2)
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail || err.message) : 'Error al guardar la dirección.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOrganizerProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await profileApi.createOrganizer(organizerProfile)
      setStep(3)
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail || err.message) : 'Error al crear el perfil.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleLogoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      if (logoFile) {
        await profileApi.uploadOrganizerLogo(logoFile)
      }
      await refreshUser()
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail || err.message) : 'Error al subir el logo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    i < step
                      ? 'bg-primary text-primary-foreground'
                      : i === step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-8 ${i < step ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
          <CardTitle>{STEPS[step].title}</CardTitle>
          <CardDescription>{STEPS[step].description}</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === 0 && (
            <form onSubmit={handlePersonalDataSubmit}>
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="firstName">Nombre *</FieldLabel>
                    <Input
                      id="firstName"
                      value={personalData.firstName}
                      onChange={(e) => setPersonalData({ ...personalData, firstName: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastName">Apellido paterno *</FieldLabel>
                    <Input
                      id="lastName"
                      value={personalData.lastName}
                      onChange={(e) => setPersonalData({ ...personalData, lastName: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="secondLastName">Apellido materno</FieldLabel>
                  <Input
                    id="secondLastName"
                    value={personalData.secondLastName}
                    onChange={(e) => setPersonalData({ ...personalData, secondLastName: e.target.value })}
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="birthDate">Fecha de nacimiento *</FieldLabel>
                  <Input
                    id="birthDate"
                    type="date"
                    value={personalData.birthDate}
                    onChange={(e) => setPersonalData({ ...personalData, birthDate: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="gender">Género *</FieldLabel>
                  <Select
                    value={personalData.gender}
                    onValueChange={(value) => setPersonalData({ ...personalData, gender: value })}
                    disabled={isLoading}
                    required
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Selecciona tu género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Masculino</SelectItem>
                      <SelectItem value="Female">Femenino</SelectItem>
                      <SelectItem value="Other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="phoneNumber">Teléfono *</FieldLabel>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="10 a 15 dígitos"
                    value={personalData.phoneNumber}
                    onChange={(e) => setPersonalData({ ...personalData, phoneNumber: e.target.value })}
                    required
                    minLength={10}
                    maxLength={15}
                    disabled={isLoading}
                  />
                </Field>

                <Button type="submit" className="w-full" disabled={isLoading || !personalData.gender}>
                  {isLoading ? <><Spinner className="mr-2" /> Guardando...</> : 'Continuar'}
                </Button>
              </FieldGroup>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={handleAddressSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="street">Calle *</FieldLabel>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="externalNumber">Número exterior *</FieldLabel>
                    <Input
                      id="externalNumber"
                      value={address.externalNumber}
                      onChange={(e) => setAddress({ ...address, externalNumber: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="internalNumber">Número interior</FieldLabel>
                    <Input
                      id="internalNumber"
                      value={address.internalNumber}
                      onChange={(e) => setAddress({ ...address, internalNumber: e.target.value })}
                      disabled={isLoading}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="neighborhood">Colonia *</FieldLabel>
                  <Input
                    id="neighborhood"
                    value={address.neighborhood}
                    onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="city">Ciudad *</FieldLabel>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="state">Estado *</FieldLabel>
                    <Input
                      id="state"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="country">País *</FieldLabel>
                    <Input
                      id="country"
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="zipCode">Código postal *</FieldLabel>
                    <Input
                      id="zipCode"
                      value={address.zipCode}
                      onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep(0)}
                    disabled={isLoading}
                  >
                    Atrás
                  </Button>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Spinner className="mr-2" /> Guardando...</> : 'Continuar'}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOrganizerProfileSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="organizationName">Nombre de la organización *</FieldLabel>
                  <Input
                    id="organizationName"
                    value={organizerProfile.organizationName}
                    onChange={(e) => setOrganizerProfile({ ...organizerProfile, organizationName: e.target.value })}
                    required
                    maxLength={120}
                    disabled={isLoading}
                  />
                </Field>

                <Separator />

                <Field>
                  <FieldLabel htmlFor="description">Descripción</FieldLabel>
                  <Input
                    id="description"
                    value={organizerProfile.description}
                    onChange={(e) => setOrganizerProfile({ ...organizerProfile, description: e.target.value })}
                    maxLength={500}
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="website">Sitio web</FieldLabel>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://"
                    value={organizerProfile.website}
                    onChange={(e) => setOrganizerProfile({ ...organizerProfile, website: e.target.value })}
                    maxLength={200}
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="facebook">Facebook</FieldLabel>
                  <Input
                    id="facebook"
                    placeholder="https://facebook.com/..."
                    value={organizerProfile.facebook}
                    onChange={(e) => setOrganizerProfile({ ...organizerProfile, facebook: e.target.value })}
                    maxLength={200}
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="instagram">Instagram</FieldLabel>
                  <Input
                    id="instagram"
                    placeholder="https://instagram.com/..."
                    value={organizerProfile.instagram}
                    onChange={(e) => setOrganizerProfile({ ...organizerProfile, instagram: e.target.value })}
                    maxLength={200}
                    disabled={isLoading}
                  />
                </Field>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                  >
                    Atrás
                  </Button>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Spinner className="mr-2" /> Guardando...</> : 'Continuar'}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleLogoSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <Field>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoChange}
                      disabled={isLoading}
                      className="cursor-pointer"
                    />
                  </Field>

                  <p className="text-xs text-muted-foreground text-center">
                    Formatos aceptados: JPEG, PNG, WebP. Este paso es opcional.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep(2)}
                    disabled={isLoading}
                  >
                    Atrás
                  </Button>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <><Spinner className="mr-2" /> {logoFile ? 'Subiendo...' : 'Finalizando...'}</>
                    ) : logoFile ? (
                      'Subir y finalizar'
                    ) : (
                      'Omitir y finalizar'
                    )}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
