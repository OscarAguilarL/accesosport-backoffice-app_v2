'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  Trophy,
} from 'lucide-react'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const navItems = [
  { title: 'Dashboard',            href: '/dashboard',            icon: LayoutDashboard },
  { title: 'Mis Eventos',          href: '/dashboard/events',     icon: Calendar },
  { title: 'Crear Evento',         href: '/dashboard/events/new', icon: PlusCircle },
  { title: 'Configuración',        href: '/dashboard/settings',   icon: Settings },
  { title: 'Portal participantes', href: '/eventos',              icon: Trophy },
]

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const initials = user?.firstName
    ? user.firstName[0].toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex h-16 shrink-0 items-center border-b border-sidebar-border px-3',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-sidebar-accent-foreground">
              AccesoSport
            </span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/dashboard">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Zap className="h-4 w-4 text-white" />
            </div>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            isCollapsed && 'hidden'
          )}
          aria-label="Colapsar sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Expand button (collapsed mode) */}
      {isCollapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mt-2 flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label="Expandir sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {!isCollapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/60">
            Menú
          </p>
        )}
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={isCollapsed ? item.title : undefined}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-sidebar-primary/10 text-sidebar-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="shrink-0 border-t border-sidebar-border p-2">
        {!isCollapsed && user && (
          <div className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">
                {user.firstName || 'Usuario'}
              </p>
              <p className="truncate text-xs text-sidebar-foreground">{user.email}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={logout}
          title={isCollapsed ? 'Cerrar sesión' : undefined}
          className={cn(
            'w-full gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            isCollapsed ? 'justify-center px-2' : 'justify-start'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Cerrar sesión</span>}
        </Button>
      </div>
    </aside>
  )
}
