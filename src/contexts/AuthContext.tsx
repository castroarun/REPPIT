'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { pushAllToCloud } from '@/lib/storage/sync'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isConfigured: boolean
  sendOtpCode: (email: string) => Promise<{ error: AuthError | null }>
  verifyOtpCode: (email: string, token: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isConfigured = isSupabaseConfigured() && process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false'

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false)
      return
    }

    // Helper to ensure user record exists
    const checkAndCreateUserRecord = async (authUser: User | null) => {
      if (!authUser) return
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const client = supabase as any
        const { data: existingUser } = await client
          .from('users')
          .select('id')
          .eq('id', authUser.id)
          .single()

        if (!existingUser) {
          await client
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email,
              created_at: authUser.created_at
            })
        }
      } catch {
        // Ignore errors
      }
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
      // Ensure user record exists for existing sessions
      await checkAndCreateUserRecord(session?.user ?? null)
      // Auto-sync all local data if user is logged in
      if (session?.user) {
        pushAllToCloud().then(result => {
          if (result.profiles > 0 || result.workouts > 0) {
            console.log(`Auto-sync on load: ${result.profiles} profiles, ${result.workouts} workouts`)
          }
        }).catch(err => {
          console.error('Auto-sync on load failed:', err)
        })
      }
    })

    // Listen for auth changes (handles magic link token exchange)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [isConfigured])

  // Send OTP code to email (no redirect - code is entered directly in app)
  const sendOtpCode = useCallback(async (email: string) => {
    if (!isConfigured) {
      return { error: new Error('Supabase not configured') as AuthError }
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true
      }
    })

    return { error }
  }, [isConfigured])

  // Ensure user record exists in public.users table (backup for trigger)
  const ensureUserRecord = useCallback(async (authUser: User) => {
    if (!isConfigured) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any
      // Check if user exists in public.users
      const { data: existingUser } = await client
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .single()

      // If not exists, create the record
      if (!existingUser) {
        await client
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            created_at: authUser.created_at
          })
      }
    } catch {
      // Ignore errors - trigger should handle this, this is just a fallback
    }
  }, [isConfigured])

  // Verify the OTP code entered by user
  const verifyOtpCode = useCallback(async (email: string, token: string) => {
    if (!isConfigured) {
      return { error: new Error('Supabase not configured') as AuthError }
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })

    // If successful, ensure user record exists and sync all local data
    if (!error && data.user) {
      await ensureUserRecord(data.user)
      // Auto-sync all local data to cloud on successful login
      pushAllToCloud().then(result => {
        console.log(`Auto-sync complete: ${result.profiles} profiles, ${result.workouts} workouts`)
        if (result.errors.length > 0) {
          console.warn('Sync errors:', result.errors)
        }
      }).catch(err => {
        console.error('Auto-sync failed:', err)
      })
    }

    return { error }
  }, [isConfigured, ensureUserRecord])

  const signOut = useCallback(async () => {
    if (!isConfigured) return

    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }, [isConfigured])

  const deleteAccount = useCallback(async () => {
    if (!isConfigured || !user) {
      return { error: new Error('Not authenticated') }
    }

    try {
      // Delete all user data (cascade will handle related records)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: deleteError } = await (supabase as any)
        .from('users')
        .delete()
        .eq('id', user.id)

      if (deleteError) throw deleteError

      // Sign out
      await signOut()

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }, [isConfigured, user, signOut])

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isConfigured,
      sendOtpCode,
      verifyOtpCode,
      signOut,
      deleteAccount
    }}>
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
