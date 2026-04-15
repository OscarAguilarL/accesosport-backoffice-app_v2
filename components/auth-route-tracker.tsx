'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const AUTH_ROUTES = ['/login', '/signup', '/onboarding']
const LAST_AUTH_PATH_KEY = 'lastAuthPath'

export function AuthRouteTracker() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && !AUTH_ROUTES.some(r => pathname.startsWith(r))) {
      sessionStorage.setItem(LAST_AUTH_PATH_KEY, pathname)
    }
  }, [pathname, isAuthenticated])

  return null
}

export function getLastAuthPath(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(LAST_AUTH_PATH_KEY)
}
