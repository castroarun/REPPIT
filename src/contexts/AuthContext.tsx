'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isConfigured: boolean
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isConfigured = isSupabaseConfigured()

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        // Create user record on first sign in
        if (event === 'SIGNED_IN' && session?.user) {
          await createUserRecord(session.user)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [isConfigured])

  // Create user record in public.users table
  const createUserRecord = async (user: User) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Error creating user record:', error)
    }
  }

  const signInWithGoogle = useCallback(async () => {
    if (!isConfigured) {
      return { error: new Error('Supabase not configured') as AuthError }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })

    return { error }
  }, [isConfigured])

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
      signInWithGoogle,
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
