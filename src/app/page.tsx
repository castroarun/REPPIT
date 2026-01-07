'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Profile, VALIDATION } from '@/types'
import { getProfiles, getProfileById, syncProfilesFromCloud } from '@/lib/storage/profiles'
import { setupSyncListeners, hasPendingSync, processSyncQueue } from '@/lib/storage/sync'
import { loadSampleData, hasSampleData } from '@/lib/storage/seedData'
import { ProfileCard, EmptyProfileSlot } from '@/components/profile'
import { ThemeToggle, UnitToggle, Logo } from '@/components/ui'
import { LoginScreen } from '@/components/auth'
import { useAuth } from '@/contexts'

const TAP_COUNT_THRESHOLD = 7
const TAP_TIMEOUT_MS = 2000

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading: authLoading, isConfigured } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Easter egg: tap logo 7 times to load sample data
  const [tapCount, setTapCount] = useState(0)
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleLogoTap = useCallback(() => {
    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current)
    }

    const newCount = tapCount + 1
    setTapCount(newCount)

    // Check if threshold reached
    if (newCount >= TAP_COUNT_THRESHOLD) {
      if (!hasSampleData()) {
        loadSampleData()
        setProfiles(getProfiles())
        setShowEasterEgg(true)
        setTimeout(() => setShowEasterEgg(false), 2000)
      }
      setTapCount(0)
    } else {
      // Reset after timeout
      tapTimeoutRef.current = setTimeout(() => {
        setTapCount(0)
      }, TAP_TIMEOUT_MS)
    }
  }, [tapCount])

  // Cleanup tap timeout on unmount
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current)
      }
    }
  }, [])

  // Setup sync listeners
  useEffect(() => {
    const cleanup = setupSyncListeners()
    return cleanup
  }, [])

  // Sync on auth or when coming online
  useEffect(() => {
    if (user && isConfigured) {
      handleSync()
    }
  }, [user, isConfigured])

  // Load profiles
  useEffect(() => {
    if (authLoading) return

    // Check if first-time user without account
    const hasSkippedLogin = localStorage.getItem('skippedLogin')
    if (!user && isConfigured && !hasSkippedLogin) {
      setShowLogin(true)
      setIsLoading(false)
      return
    }

    // Check for last visited profile and redirect if it still exists
    const lastVisitedProfileId = localStorage.getItem('lastVisitedProfile')
    if (lastVisitedProfileId) {
      const lastProfile = getProfileById(lastVisitedProfileId)
      if (lastProfile) {
        router.push(`/profile/${lastVisitedProfileId}`)
        return
      } else {
        // Profile was deleted, clear the saved preference
        localStorage.removeItem('lastVisitedProfile')
      }
    }

    setProfiles(getProfiles())
    setIsLoading(false)
  }, [router, authLoading, user, isConfigured])

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      // Push pending changes first
      if (hasPendingSync()) {
        await processSyncQueue()
      }
      // Then pull from cloud
      await syncProfilesFromCloud()
      setProfiles(getProfiles())
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSkipLogin = () => {
    localStorage.setItem('skippedLogin', 'true')
    setShowLogin(false)
    setProfiles(getProfiles())
  }

  const emptySlots = VALIDATION.maxProfiles - profiles.length

  // Show login screen for first-time users
  if (showLogin) {
    return <LoginScreen onSkip={handleSkipLogin} />
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-[#2C3E50] text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={handleLogoTap}
              className="focus:outline-none active:scale-95 transition-transform"
              aria-label="REPPIT Logo"
            >
              <Logo size="lg" />
            </button>
            <p className="text-xs text-gray-400 mt-0.5">Personal strength logger app</p>
            <p className="text-sm text-gray-300 mt-1">
              {profiles.length} of {VALIDATION.maxProfiles} profiles
              {isSyncing && <span className="ml-2">• Syncing...</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <UnitToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Sync Status Banner - More prominent warning */}
      {!user && isConfigured && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-b-2 border-amber-300 dark:border-amber-700 px-4 py-3">
          <div className="flex items-start gap-2 max-w-lg mx-auto">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Your data is only stored locally
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Uninstalling the app will delete all data.{' '}
                <Link href="/settings" className="underline font-medium hover:no-underline">
                  Sign in
                </Link>
                {' '}to backup to cloud.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="p-4 max-w-lg mx-auto">
        {/* Existing Profiles */}
        <div className="space-y-3">
          {profiles.map(profile => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}

          {/* Empty Slots */}
          {Array.from({ length: emptySlots }).map((_, index) => (
            <EmptyProfileSlot
              key={`empty-${index}`}
              disabled={index > 0}
            />
          ))}
        </div>

        {/* Empty State */}
        {profiles.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#2C3E50] dark:text-gray-100 mb-1">
              No profiles yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create your first profile to get started tracking your strength standards.
            </p>
          </div>
        )}

      </main>

      {/* Tap counter indicator (subtle) */}
      {tapCount > 0 && tapCount < TAP_COUNT_THRESHOLD && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800/80 text-white text-xs px-3 py-1.5 rounded-full">
          {TAP_COUNT_THRESHOLD - tapCount} more...
        </div>
      )}

      {/* Easter egg success toast */}
      {showEasterEgg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <span className="text-lg">🎉</span>
          <span className="font-medium">Sample data loaded!</span>
        </div>
      )}
    </div>
  )
}
