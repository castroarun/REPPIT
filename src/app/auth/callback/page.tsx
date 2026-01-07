'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!isSupabaseConfigured()) {
        setError('Authentication not configured')
        setTimeout(() => router.push('/'), 2000)
        return
      }

      // Get the code from URL hash or search params
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const searchParams = new URLSearchParams(window.location.search)

      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const code = searchParams.get('code')

      if (accessToken && refreshToken) {
        // Handle token-based auth (implicit flow)
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })

        if (error) {
          setError('Authentication failed')
          setTimeout(() => router.push('/'), 2000)
          return
        }

        router.push('/')
      } else if (code) {
        // Handle code-based auth (PKCE flow)
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          setError('Authentication failed')
          setTimeout(() => router.push('/'), 2000)
          return
        }

        router.push('/')
      } else {
        setError('No authentication data found')
        setTimeout(() => router.push('/'), 2000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-500 text-lg mb-2">{error}</div>
            <p className="text-gray-500">Redirecting...</p>
          </>
        ) : (
          <>
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  )
}
