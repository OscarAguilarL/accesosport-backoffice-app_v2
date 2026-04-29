'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Zap, LogOut, LogIn } from 'lucide-react'

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated, isLoading, user, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/eventos" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">AccesoSport</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/eventos"
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  pathname?.startsWith('/eventos')
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                Eventos
              </Link>
              {isAuthenticated && (
                <Link
                  href="/mis-inscripciones"
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    pathname === '/mis-inscripciones'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  Mis inscripciones
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  href="/perfil"
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    pathname === '/perfil'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  Mi perfil
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user && (
                  <span className="text-sm text-muted-foreground">
                    {user.firstName || user.email}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Salir
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" asChild>
                <Link href="/login" className="gap-2 flex items-center">
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}
