'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // OTP flow handles auth in-app, so just redirect to home
    // This page exists as a fallback in case users bookmark or access it directly
    const timer = setTimeout(() => {
      router.replace('/')
    }, 1500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#2C3E50] text-white p-6">
      <div className="text-center max-w-sm">
        <div className="mb-8">
          <Logo size="lg" />
        </div>
        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-300">Redirecting to app...</p>
      </div>
    </div>
  )
}
