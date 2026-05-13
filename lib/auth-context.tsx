'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { auth as authApi, user as userApi, ApiError } from './api'
import type { UserInformationDto, LoginRequest, RegisterRequest } from './types'

interface AuthContextType {
  user: UserInformationDto | null
  roles: string[]
  isLoading: boolean
  isAuthenticated: boolean
  needsOnboarding: boolean
  login: (data: LoginRequest) => Promise<string[]>
  signup: (data: RegisterRequest) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getRolesFromToken(token: string): string[] {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (Array.isArray(payload.roles)) return payload.roles
    if (typeof payload.roles === 'string' && payload.roles) return payload.roles.split(',')
    return []
  } catch {
    return []
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInformationDto | null>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setUser(null)
        setRoles([])
        setNeedsOnboarding(false)
        return
      }
      setRoles(getRolesFromToken(token))
      const userData = await userApi.getMe()
      setUser(userData)
      setNeedsOnboarding(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setNeedsOnboarding(true)
        setUser(null)
        return
      }
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
      setRoles([])
      setNeedsOnboarding(false)
    }
  }, [])

  useEffect(() => {
    fetchUser().finally(() => setIsLoading(false))
  }, [fetchUser])

  const login = async (data: LoginRequest): Promise<string[]> => {
    const response = await authApi.login(data)
    localStorage.setItem('accessToken', response.token)
    setRoles(response.roles)
    setIsLoading(true)
    await fetchUser()
    setIsLoading(false)
    return response.roles
  }

  const signup = async (data: RegisterRequest) => {
    const response = await authApi.signup(data)
    localStorage.setItem('accessToken', response.token)
    await fetchUser()
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    setUser(null)
    setRoles([])
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        isLoading,
        isAuthenticated: !!user,
        needsOnboarding,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
