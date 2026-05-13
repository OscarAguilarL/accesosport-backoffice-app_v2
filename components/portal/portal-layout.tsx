'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Zap, LogOut, LogIn, Menu, X, Calendar, Ticket, User, Home, LayoutDashboard } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Inicio', icon: Home, exact: true },
  { href: '/eventos', label: 'Eventos', icon: Calendar },
]

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated, isLoading, user, roles, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  const isOrganizer = roles.includes('ROLE_ORGANIZER') || roles.includes('ROLE_ADMIN')

  const initials = user?.firstName
    ? user.firstName[0].toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'U'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-amber-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-amber-500" />
          <p className="text-sm font-medium text-amber-700">Cargando...</p>
        </div>
      </div>
    )
  }

  const visibleLinks = navLinks

  return (
    <div className="flex min-h-screen flex-col bg-amber-50 font-barlow">
      {/* Racing stripe + Header — fixed to top */}
      <div className="fixed left-0 right-0 top-0 z-40">
        <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />
        <header className="border-b border-amber-100 bg-white/95 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <span className="font-barlow-condensed text-xl font-bold tracking-wide text-gray-900">
              ACCESOSPORT
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden flex-1 items-center gap-1 pl-8 sm:flex">
            {visibleLinks.map(link => {
              const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop auth */}
          <div className="hidden items-center gap-3 sm:flex">
            {isAuthenticated ? (
              <div ref={avatarRef} className="relative">
                <button
                  onClick={() => setAvatarOpen(!avatarOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-black transition-all hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                  aria-label="Menú de usuario"
                >
                  {initials}
                </button>

                {avatarOpen && (
                  <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                    {/* User info */}
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user?.email}
                      </p>
                      {user?.firstName && (
                        <p className="truncate text-xs text-gray-500">{user.email}</p>
                      )}
                    </div>

                    {/* Links */}
                    <div className="p-1">
                      <Link
                        href="/perfil"
                        onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        Mi perfil
                      </Link>
                      <Link
                        href="/mis-inscripciones"
                        onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <Ticket className="h-4 w-4 text-gray-400" />
                        Mis inscripciones
                      </Link>

                      {isOrganizer && (
                        <>
                          <div className="my-1 border-t border-gray-100" />
                          <Link
                            href="/dashboard"
                            onClick={() => setAvatarOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
                          >
                            <LayoutDashboard className="h-4 w-4 text-blue-500" />
                            Panel de organizador
                          </Link>
                        </>
                      )}

                      <div className="my-1 border-t border-gray-100" />
                      <button
                        onClick={() => { logout(); setAvatarOpen(false) }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button size="sm" asChild className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                <Link href="/login" className="flex items-center">
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 sm:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        </header>
      </div>

      {/* Spacer to offset fixed header (stripe 4px + header 64px) */}
      <div className="h-[68px] shrink-0" />

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 right-0 top-0 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-amber-100 px-4 py-4">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400">
                  <Zap className="h-4 w-4 text-black" />
                </div>
                <span className="font-barlow-condensed text-lg font-bold tracking-wide text-gray-900">
                  ACCESOSPORT
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-3">
              {visibleLinks.map(link => {
                const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                      isActive ? 'bg-amber-100 text-amber-800' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t border-gray-100 p-3">
              {isAuthenticated ? (
                <div className="space-y-1">
                  {user && (
                    <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-black">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.email}
                        </p>
                        {user.firstName && (
                          <p className="truncate text-xs text-gray-500">{user.email}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {isOrganizer && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Panel de organizador
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setMobileOpen(false) }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white"
                >
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-100 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400">
                <Zap className="h-3.5 w-3.5 text-black" />
              </div>
              <span className="font-barlow-condensed font-bold tracking-wide text-gray-900">
                ACCESOSPORT
              </span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/eventos" className="hover:text-gray-900">Eventos</Link>
              {isAuthenticated && (
                <Link href="/mis-inscripciones" className="hover:text-gray-900">Mis inscripciones</Link>
              )}
              {!isAuthenticated && (
                <Link href="/login" className="hover:text-gray-900">Iniciar sesión</Link>
              )}
              {!isAuthenticated && (
                <Link href="/signup" className="hover:text-gray-900">Registrarse</Link>
              )}
            </div>
            <p className="text-xs text-gray-400">© 2026 AccesoSport. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
