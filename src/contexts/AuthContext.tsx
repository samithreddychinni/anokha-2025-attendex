import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '@/lib/api'
import { hashPassword } from '@/lib/utils'
import { useRouter } from '@tanstack/react-router'
import type { Organizer, AuthContextType } from '@/types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Organizer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await api.get('/auth/organizer/session')
        if (data?.email) {
          setUser(data)
        }
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  const login = async (email: string, password: string) => {
    const hashedPassword = await hashPassword(password)
    const response = await api.post('/auth/organizer/login', { email, password: hashedPassword })
    const { data } = response

    if (data.email) {
      setUser(data)
    } else {
      const session = await api.get('/auth/organizer/session')
      setUser(session.data)
    }
  }

  const logout = async () => {
    try {
      await api.get('/auth/organizer/logout')
    } catch {
      //logout may fail silently if session already expired
    }
    setUser(null)
    router.navigate({ to: '/login' })
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
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
