'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { profile as profileApi, ApiError } from '@/lib/api'
import type { OrganizerProfileResponse } from '@/lib/types'
import { Building2, Globe, Instagram, Facebook, Save } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [organizerProfile, setOrganizerProfile] = useState<OrganizerProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    organizationName: '',
    website: '',
    facebook: '',
    instagram: '',
    description: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.getOrganizer()
        setOrganizerProfile(data)
        setFormData({
          organizationName: data.organizationName || '',
          website: data.website || '',
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          description: data.description || '',
        })
      } catch (error) {
        console.log('[v0] Profile not found, user can create one')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const { profile } = await profileApi.createOrganizer(formData)
      setOrganizerProfile(profile)
    } catch (error) {
      console.log('[v0] Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoChange = async (file: File) => {
    setIsUploadingLogo(true)
    setLogoError(null)
    try {
      const updated = await profileApi.uploadOrganizerLogo(file)
      setOrganizerProfile(updated)
    } catch (err) {
      setLogoError(err instanceof ApiError ? (err.detail || err.message) : 'Error al subir el logo.')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  return (
    <DashboardLayout title="Configuración" description="Administra tu perfil y preferencias">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
            <CardDescription>Tu información básica de usuario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-foreground">{user?.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                <p className="text-foreground">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : 'Sin configurar'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organizer Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Perfil de Organizador
            </CardTitle>
            <CardDescription>
              Información pública que aparecerá en tus eventos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">Logo de la organización</p>
                  <ImageDropzone
                    preview={organizerProfile?.logoUrl ?? null}
                    onChange={handleLogoChange}
                    onRemove={undefined}
                    disabled={isUploadingLogo}
                    shape="circle"
                    className="w-full"
                  />
                  {isUploadingLogo && (
                    <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Spinner className="h-4 w-4" /> Subiendo logo...
                    </p>
                  )}
                  {logoError && (
                    <p className="text-center text-sm text-destructive">{logoError}</p>
                  )}
                </div>

              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="organizationName">
                      Nombre de la Organización *
                    </FieldLabel>
                    <Input
                      id="organizationName"
                      value={formData.organizationName}
                      onChange={(e) =>
                        setFormData({ ...formData, organizationName: e.target.value })
                      }
                      placeholder="Mi Organización Deportiva"
                      required
                      maxLength={120}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="description">Descripción</FieldLabel>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Describe tu organización..."
                      rows={4}
                      maxLength={500}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="website">
                      <Globe className="mr-2 inline h-4 w-4" />
                      Sitio Web
                    </FieldLabel>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://miorganizacion.com"
                      maxLength={200}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="facebook">
                        <Facebook className="mr-2 inline h-4 w-4" />
                        Facebook
                      </FieldLabel>
                      <Input
                        id="facebook"
                        value={formData.facebook}
                        onChange={(e) =>
                          setFormData({ ...formData, facebook: e.target.value })
                        }
                        placeholder="facebook.com/miorganizacion"
                        maxLength={200}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="instagram">
                        <Instagram className="mr-2 inline h-4 w-4" />
                        Instagram
                      </FieldLabel>
                      <Input
                        id="instagram"
                        value={formData.instagram}
                        onChange={(e) =>
                          setFormData({ ...formData, instagram: e.target.value })
                        }
                        placeholder="@miorganizacion"
                        maxLength={200}
                      />
                    </Field>
                  </div>

                  {organizerProfile?.verificationStatus && (
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm">
                        <span className="font-medium">Estado de verificación: </span>
                        <span className="text-muted-foreground">
                          {organizerProfile.verificationStatus}
                        </span>
                      </p>
                    </div>
                  )}

                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Spinner className="mr-2" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </FieldGroup>
              </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
