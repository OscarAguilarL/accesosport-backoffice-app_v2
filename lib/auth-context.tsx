'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { auth as authApi, user as userApi } from './api'
import type { UserInformationDto, LoginRequest, RegisterRequest } from './types'

interface AuthContextType {
  user: UserInformationDto | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  signup: (data: RegisterRequest) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInformationDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setUser(null)
        return
      }
      const userData = await userApi.getMe()
      setUser(userData)
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    }
  }, [])

  useEffect(() => {
    fetchUser().finally(() => setIsLoading(false))
  }, [fetchUser])

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data)
    localStorage.setItem('accessToken', response.token)
    await fetchUser()
  }

  const signup = async (data: RegisterRequest) => {
    const response = await authApi.signup(data)
    localStorage.setItem('accessToken', response.token)
    await fetchUser()
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    setUser(null)
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
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
