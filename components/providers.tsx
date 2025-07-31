"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  isSupabaseConfigured: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  isSupabaseConfigured: false,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Create stable supabase client
  const supabase = useMemo(() => createClient(), [])

  // Check if Supabase is properly configured
  const isSupabaseConfigured = useMemo(
    () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    [],
  )

  // Create stable mock user
  const mockUser = useMemo(
    () =>
      ({
        id: "demo-user",
        email: "demo@solardg.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: "authenticated",
        role: "authenticated",
        app_metadata: {},
        user_metadata: {},
      }) as User,
    [],
  )

  useEffect(() => {
    const getUser = async () => {
      if (!isSupabaseConfigured) {
        // For demo purposes, set a mock user when Supabase is not configured
        setUser(mockUser)
        setLoading(false)
        return
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Error getting user:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    }
  }, [isSupabaseConfigured, mockUser, supabase])

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    } else {
      // For demo mode, just clear the mock user
      setUser(null)
    }
  }, [isSupabaseConfigured, supabase])

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      signOut,
      isSupabaseConfigured,
    }),
    [user, loading, signOut, isSupabaseConfigured],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
