'use client'

import { useEffect, useRef, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { checkin as checkinApi, registrations as registrationsApi } from '@/lib/api'
import type { ParticipantInEventResponse } from '@/lib/types'
import { ArrowLeft, CheckCircle2, Package, QrCode, Search, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const SHIRT_SIZE_LABELS: Record<string, string> = {
  SIZE_XS: 'XS',
  SIZE_S: 'S',
  SIZE_M: 'M',
  SIZE_L: 'L',
  SIZE_XL: 'XL',
  SIZE_XXL: 'XXL',
}

const BLOOD_TYPE_LABELS: Record<string, string> = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
}

interface SessionEntry {
  bibNumber: number | null
  fullName: string | null
  deliveredAt: string
}

type SearchError = 'not_found' | 'cancelled' | null

export default function CheckinPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)

  const [code, setCode] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isDelivering, setIsDelivering] = useState(false)
  const [participant, setParticipant] = useState<ParticipantInEventResponse | null>(null)
  const [searchError, setSearchError] = useState<SearchError>(null)

  const [totalConfirmed, setTotalConfirmed] = useState(0)
  const [kitsDelivered, setKitsDelivered] = useState(0)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const [sessionHistory, setSessionHistory] = useState<SessionEntry[]>([])

  const [showScanner, setShowScanner] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [deliveryError, setDeliveryError] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const list = await registrationsApi.getByEvent(eventId)
        const confirmed = list.filter(p => p.status === 'CONFIRMED')
        setTotalConfirmed(confirmed.length)
        setKitsDelivered(confirmed.filter(p => p.kitPickedUp).length)
      } catch {
        // stats are best-effort
      } finally {
        setIsLoadingStats(false)
      }
    }
    fetchStats()
  }, [eventId])

  useEffect(() => {
    if (!showScanner) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scanner: any = null

    const initScanner = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true })
      } catch {
        setCameraError(true)
        setShowScanner(false)
        return
      }

      const { Html5QrcodeScanner } = await import('html5-qrcode')
      scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      )
      scannerRef.current = scanner
      scanner.render(
        (decodedText: string) => {
          setCode(decodedText.toUpperCase())
          setShowScanner(false)
          scanner?.clear().catch(() => null)
          handleSearch(decodedText.toUpperCase())
        },
        () => null
      )
    }

    initScanner()

    return () => {
      scanner?.clear().catch(() => null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showScanner])

  const handleSearch = async (overrideCode?: string) => {
    const searchCode = overrideCode ?? code
    if (!searchCode.trim()) return

    setIsSearching(true)
    setParticipant(null)
    setSearchError(null)

    try {
      const result = await checkinApi.findByCode(searchCode.trim())
      if (result.status === 'CANCELLED') {
        setSearchError('cancelled')
      } else {
        setParticipant(result)
      }
    } catch {
      setSearchError('not_found')
    } finally {
      setIsSearching(false)
    }
  }

  const handleDeliverKit = async () => {
    if (!participant) return

    setIsDelivering(true)
    setDeliveryError(false)
    try {
      const updated = await checkinApi.markKitDelivered(participant.ticketCode)
      setParticipant(updated)
      setKitsDelivered(prev => prev + 1)
      setSessionHistory(prev => [
        {
          bibNumber: updated.bibNumber,
          fullName: updated.fullName,
          deliveredAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.slice(0, 4),
      ])

      await new Promise(resolve => setTimeout(resolve, 1500))
      setParticipant(null)
      setCode('')
      inputRef.current?.focus()
    } catch {
      setDeliveryError(true)
    } finally {
      setIsDelivering(false)
    }
  }

  const handleCloseScanner = () => {
    scannerRef.current?.clear().catch(() => null)
    setShowScanner(false)
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header fijo, sin sidebar */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/events/${eventId}`}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <span className="font-semibold">Check-in de kits</span>
          <div className="flex items-center gap-1.5 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            {isLoadingStats ? (
              <Spinner className="h-3.5 w-3.5" />
            ) : (
              <span className="font-medium tabular-nums">
                {kitsDelivered} / {totalConfirmed}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-lg space-y-5">

          {/* Zona de búsqueda */}
          <Card>
            <CardContent className="pt-5 space-y-3">
              <Input
                ref={inputRef}
                autoFocus
                placeholder="Código del boleto — ej: ACSP-4X7K"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="h-14 text-center font-mono text-xl tracking-widest"
                disabled={isSearching}
              />
              <div className="flex gap-2">
                <Button
                  className="h-12 flex-1 text-base"
                  onClick={() => handleSearch()}
                  disabled={!code.trim() || isSearching}
                >
                  {isSearching
                    ? <Spinner className="mr-2 h-4 w-4" />
                    : <Search className="mr-2 h-4 w-4" />}
                  Buscar
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-4"
                  onClick={() => { setCameraError(false); setShowScanner(true) }}
                  title="Escanear QR"
                >
                  <QrCode className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alertas de error */}
          {deliveryError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Error al registrar la entrega. Verifica la conexión e intenta de nuevo.
              </AlertDescription>
            </Alert>
          )}
          {cameraError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                No se pudo acceder a la cámara. Para usar el escáner QR necesitas abrir la app por HTTPS o conceder permiso de cámara.
              </AlertDescription>
            </Alert>
          )}
          {searchError === 'not_found' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Código no válido o no pertenece a este evento.
              </AlertDescription>
            </Alert>
          )}
          {searchError === 'cancelled' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Esta inscripción fue cancelada.
              </AlertDescription>
            </Alert>
          )}

          {/* Tarjeta del participante */}
          {participant && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Inscripción válida</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {participant.ticketCode}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xl font-bold leading-tight">{participant.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    Dorsal #{participant.bibNumber ?? '—'}
                  </p>
                </div>

                {/* Kit type — highlighted for organizer at delivery */}
                <div className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                  participant.wantsShirt
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Package className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold leading-tight">
                      {participant.wantsShirt ? 'Kit CON playera' : 'Kit SIN playera'}
                    </p>
                    {participant.wantsShirt && participant.shirtSize && (
                      <p className="text-sm">
                        Talla {SHIRT_SIZE_LABELS[participant.shirtSize] ?? participant.shirtSize}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Talla de playera</p>
                    <p className="font-medium">
                      {participant.shirtSize
                        ? (SHIRT_SIZE_LABELS[participant.shirtSize] ?? participant.shirtSize)
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Grupo sanguíneo</p>
                    <p className="font-medium">
                      {participant.bloodType
                        ? (BLOOD_TYPE_LABELS[participant.bloodType] ?? participant.bloodType)
                        : '—'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Contacto de emergencia</p>
                    <p className="font-medium">
                      {participant.emergencyContactName} · {participant.emergencyContactPhone}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estado del kit</span>
                    {participant.kitPickedUp ? (
                      <Badge className="bg-success/15 text-success border-success/30">
                        Entregado ✓
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                        Pendiente
                      </Badge>
                    )}
                  </div>
                  {participant.kitPickedUp && participant.kitPickedUpAt && (
                    <p className="text-xs text-muted-foreground">
                      Entregado el{' '}
                      {format(new Date(participant.kitPickedUpAt), "d MMM yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                  )}
                  <Button
                    className="h-14 w-full text-base"
                    onClick={handleDeliverKit}
                    disabled={participant.kitPickedUp || isDelivering}
                  >
                    {isDelivering
                      ? <Spinner className="mr-2 h-4 w-4" />
                      : <Package className="mr-2 h-5 w-5" />}
                    {participant.kitPickedUp ? 'Kit ya entregado' : 'Entregar kit'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historial de sesión */}
          {sessionHistory.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Últimas entregas (esta sesión)
              </p>
              <div className="divide-y rounded-lg border bg-card">
                {sessionHistory.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span>
                      {entry.bibNumber !== null ? `#${entry.bibNumber} ` : ''}
                      {entry.fullName}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{entry.deliveredAt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal del escáner QR */}
      <Dialog open={showScanner} onOpenChange={handleCloseScanner}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Escanear código QR
            </DialogTitle>
          </DialogHeader>
          <div id="qr-reader" className="w-full" />
        </DialogContent>
      </Dialog>
    </div>
  )
}
