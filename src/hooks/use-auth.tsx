import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import type { EditorialUser } from '@/services/editorial'

interface AuthContextValue {
  user: EditorialUser | null
  isAuthenticated: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: unknown | null }>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<EditorialUser | null>(
    pb.authStore.isValid ? (pb.authStore.record as EditorialUser) : null,
  )
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      const valid = pb.authStore.isValid
      setUser(valid && record ? (record as EditorialUser) : null)
      setIsAuthenticated(valid)
    })

    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .catch(() => pb.authStore.clear())
        .finally(() => setLoading(false))
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      setLoading(false)
    }

    return unsubscribe
  }, [])

  async function signIn(email: string, password: string) {
    try {
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  function signOut() {
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
