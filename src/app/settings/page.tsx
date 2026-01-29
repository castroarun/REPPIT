'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts'
import { Button, ThemeToggle, UnitToggle } from '@/components/ui'
import { getPendingSyncCount, processSyncQueue, pushAllToCloud } from '@/lib/storage/sync'
import { getLastSyncTime } from '@/lib/storage/profiles'
import {
  requestNotificationPermission,
  getNotificationPermission,
  notificationsSupported
} from '@/lib/pwa/notifications'
import { loadSampleData, hasSampleData, removeSampleData } from '@/lib/storage/seedData'
import { getTimerSettings, saveTimerSettings, resetTimerHistory, formatTime } from '@/lib/storage/timer'
import { DEFAULT_TIMER_SETTINGS, TIMER_PRESETS } from '@/types'
import { GesturesOnboarding, resetAllTips } from '@/components/onboarding'
import { areTipsEnabled, enableTips, disableTips, resetOnboarding } from '@/lib/storage/onboarding'
import { getSelectedRoutine } from '@/lib/storage/routines'

const EMAIL_DOMAINS = ['@gmail.com', '@yahoo.com', '@outlook.com', '@icloud.com', '@hotmail.com']

export default function SettingsPage() {
  const router = useRouter()
  const { user, isConfigured, sendOtpCode, verifyOtpCode, signOut, deleteAccount } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [signInEmail, setSignInEmail] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isPushingAll, setIsPushingAll] = useState(false)
  const [pushResult, setPushResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission | 'unsupported'>('default')
  const [isRequestingNotifications, setIsRequestingNotifications] = useState(false)
  const [hasSamples, setHasSamples] = useState(false)
  const [devTapCount, setDevTapCount] = useState(0)
  const [showDevMode, setShowDevMode] = useState(false)
  const [defaultSets, setDefaultSets] = useState(DEFAULT_TIMER_SETTINGS.defaultSets)
  const [defaultDuration, setDefaultDuration] = useState(DEFAULT_TIMER_SETTINGS.defaultDuration)
  const [showTargetSuggestions, setShowTargetSuggestions] = useState(DEFAULT_TIMER_SETTINGS.showTargetSuggestions)
  const [showGesturesGuide, setShowGesturesGuide] = useState(false)
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null)
  const [tipsEnabled, setTipsEnabled] = useState(true)
  const [activeRoutineName, setActiveRoutineName] = useState<string | null>(null)
  const hasAutoSubmitted = useRef(false)

  // Show domain suggestions when user has typed something but no @ yet
  const showDomainSuggestions = signInEmail.length > 0 && !signInEmail.includes('@')

  const handleDomainSelect = (domain: string) => {
    setSignInEmail(signInEmail + domain)
  }

  // Auto-verify OTP when 6 digits entered
  const autoVerifyOtp = useCallback(async (code: string) => {
    if (code.length !== 6 || isSigningIn || hasAutoSubmitted.current) return

    hasAutoSubmitted.current = true
    setIsSigningIn(true)
    setError(null)

    const { error } = await verifyOtpCode(signInEmail, code)
    setIsSigningIn(false)

    if (error) {
      setError(error.message)
      hasAutoSubmitted.current = false
    }
  }, [signInEmail, isSigningIn, verifyOtpCode])

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (codeSent && otpCode.length === 6 && !hasAutoSubmitted.current) {
      autoVerifyOtp(otpCode)
    }
  }, [otpCode, codeSent, autoVerifyOtp])

  useEffect(() => {
    setNotificationStatus(getNotificationPermission())
    setHasSamples(hasSampleData())
    // Check if dev mode was previously unlocked
    const devModeUnlocked = localStorage.getItem('devModeUnlocked') === 'true'
    setShowDevMode(devModeUnlocked)
    // Load timer/workout settings
    const timerSettings = getTimerSettings()
    setDefaultSets(timerSettings.defaultSets)
    setDefaultDuration(timerSettings.defaultDuration)
    setShowTargetSuggestions(timerSettings.showTargetSuggestions ?? true)
    // Get last visited profile for linking to Training Program
    const lastProfileId = localStorage.getItem('lastVisitedProfile')
    setCurrentProfileId(lastProfileId)
    // Load tips setting
    setTipsEnabled(areTipsEnabled())
    // Load active routine
    const selectedRoutine = getSelectedRoutine()
    setActiveRoutineName(selectedRoutine?.name || null)
  }, [])

  const handleToggleTips = () => {
    if (tipsEnabled) {
      disableTips()
      setTipsEnabled(false)
    } else {
      enableTips()
      resetOnboarding() // Reset so tips can show again
      resetAllTips() // Reset contextual tips
      setTipsEnabled(true)
    }
  }

  // Handle secret tap on version to unlock developer mode
  const handleVersionTap = () => {
    const newCount = devTapCount + 1
    setDevTapCount(newCount)

    if (newCount >= 10) {
      setShowDevMode(true)
      localStorage.setItem('devModeUnlocked', 'true')
      setDevTapCount(0)
    }
  }

  const handleEnableNotifications = async () => {
    setIsRequestingNotifications(true)
    const granted = await requestNotificationPermission()
    setNotificationStatus(granted ? 'granted' : 'denied')
    setIsRequestingNotifications(false)
  }

  const pendingCount = getPendingSyncCount()
  const lastSync = getLastSyncTime()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!signInEmail.trim()) {
      setError('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(signInEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setIsSigningIn(true)
    setError(null)

    const { error } = await sendOtpCode(signInEmail)
    setIsSigningIn(false)

    if (error) {
      setError(error.message)
    } else {
      setCodeSent(true)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    const code = otpCode.replace(/\s/g, '')
    if (code.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setIsSigningIn(true)
    setError(null)

    const { error } = await verifyOtpCode(signInEmail, code)
    setIsSigningIn(false)

    if (error) {
      setError(error.message)
    }
    // Success - AuthContext will update automatically
  }

  const handleResendCode = async () => {
    setIsSigningIn(true)
    setError(null)

    const { error } = await sendOtpCode(signInEmail)
    setIsSigningIn(false)

    if (error) {
      setError(error.message)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    localStorage.removeItem('skippedLogin')
    setIsSigningOut(false)
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    const { error } = await deleteAccount()
    if (error) {
      setError(error.message)
      setIsDeleting(false)
    } else {
      localStorage.clear()
      router.push('/')
    }
  }

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      await processSyncQueue()
    } catch (err) {
      console.error('Sync failed:', err)
    }
    setIsSyncing(false)
  }

  const handlePushAllData = async () => {
    setIsPushingAll(true)
    setPushResult(null)
    try {
      const result = await pushAllToCloud()
      if (result.errors.length > 0) {
        console.error('Push errors:', result.errors)
        setPushResult(`Synced ${result.profiles} profiles, ${result.workouts} workouts (${result.errors.length} errors)`)
      } else {
        setPushResult(`Synced ${result.profiles} profiles, ${result.workouts} workouts`)
      }
      // Clear result after 5 seconds
      setTimeout(() => setPushResult(null), 5000)
    } catch (err) {
      console.error('Push all failed:', err)
      setPushResult('Sync failed')
    }
    setIsPushingAll(false)
  }

  const handleLoadSampleData = () => {
    loadSampleData()
    setHasSamples(true)
  }

  const handleRemoveSampleData = () => {
    removeSampleData()
    setHasSamples(false)
  }

  const handleDefaultSetsChange = (newValue: number) => {
    const clampedValue = Math.max(1, Math.min(10, newValue))
    setDefaultSets(clampedValue)
    saveTimerSettings({ defaultSets: clampedValue })
  }

  const handleDefaultDurationChange = (duration: number) => {
    setDefaultDuration(duration)
    saveTimerSettings({ defaultDuration: duration })
    // Clear per-exercise timer history so the new default applies everywhere
    resetTimerHistory()
  }

  const handleToggleTargetSuggestions = () => {
    const newValue = !showTargetSuggestions
    setShowTargetSuggestions(newValue)
    saveTimerSettings({ showTargetSuggestions: newValue })
  }

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-[#2C3E50] text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        {/* Account Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-[#2C3E50] dark:text-gray-100">Account</h2>
          </div>
          <div className="p-4">
            {user ? (
              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {(user.email?.[0] || 'U').toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-[#2C3E50] dark:text-gray-100">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Sync Status */}
                <div className="py-2 border-t border-gray-100 dark:border-gray-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Sync Status
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last sync: {formatLastSync(lastSync)}
                        {pendingCount > 0 && (
                          <span className="text-amber-500 ml-2">
                            • {pendingCount} pending
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={handleManualSync}
                      disabled={isSyncing || pendingCount === 0}
                      className="text-sm text-blue-500 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                  </div>

                  {/* Push All Data Button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Backup All Data
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Push all local data to cloud
                      </p>
                    </div>
                    <button
                      onClick={handlePushAllData}
                      disabled={isPushingAll}
                      className="text-sm text-green-500 hover:text-green-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {isPushingAll ? 'Uploading...' : 'Upload All'}
                    </button>
                  </div>

                  {/* Push Result */}
                  {pushResult && (
                    <p className={`text-xs text-center ${pushResult.includes('error') || pushResult.includes('failed') ? 'text-amber-500' : 'text-green-500'}`}>
                      {pushResult}
                    </p>
                  )}
                </div>

                {/* Sign Out */}
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? 'Signing out...' : 'Sign Out'}
                </Button>
              </div>
            ) : isConfigured ? (
              codeSent ? (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-700 dark:text-gray-200">Enter verification code</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      We sent a 6-digit code to <span className="font-medium">{signInEmail}</span>
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      disabled={isSigningIn}
                      autoComplete="one-time-code"
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-center text-xl font-mono tracking-[0.3em] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                    {/* Paste from clipboard button */}
                    {otpCode.length < 6 && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText()
                            const digits = text.replace(/[^0-9]/g, '').slice(0, 6)
                            if (digits.length > 0) {
                              setOtpCode(digits)
                            }
                          } catch {
                            // Clipboard access denied - ignore
                          }
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 transition-colors"
                      >
                        Paste
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSigningIn || otpCode.length !== 6}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSigningIn ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Verify & Sign In'
                    )}
                  </button>
                  <div className="flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isSigningIn}
                      className="text-sm text-blue-500 hover:text-blue-600 disabled:opacity-50"
                    >
                      Resend code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCodeSent(false)
                        setOtpCode('')
                        setSignInEmail('')
                      }}
                      className="text-sm text-gray-500 hover:text-gray-600"
                    >
                      Change email
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sign in to sync your data across all your devices.
                  </p>
                  <div className="space-y-2">
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="Enter your email"
                      disabled={isSigningIn}
                      autoComplete="email"
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />

                    {/* Domain quick-select buttons */}
                    {showDomainSuggestions && (
                      <div className="flex flex-wrap gap-1.5">
                        {EMAIL_DOMAINS.map(domain => (
                          <button
                            key={domain}
                            type="button"
                            onClick={() => handleDomainSelect(domain)}
                            disabled={isSigningIn}
                            className="px-2.5 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-500 transition-colors disabled:opacity-50"
                          >
                            {domain}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSigningIn}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSigningIn ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Sign-In Code
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    No password needed - we&apos;ll email you a 6-digit code
                  </p>
                  {pendingCount > 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                      {pendingCount} changes waiting to sync
                    </p>
                  )}
                </form>
              )
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cloud sync is not configured. Your data is stored locally on this device.
              </p>
            )}

            {error && (
              <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
            )}
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-[#2C3E50] dark:text-gray-100">Preferences</h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-200">Theme</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Light or dark mode</p>
              </div>
              <ThemeToggle />
            </div>

            {/* Units */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-200">Weight Unit</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Kilograms or pounds</p>
              </div>
              <UnitToggle />
            </div>

            {/* Notifications */}
            {notificationsSupported() && (
              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-200">Notifications</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {notificationStatus === 'granted'
                      ? 'Enabled - workout reminders active'
                      : notificationStatus === 'denied'
                      ? 'Blocked - enable in browser settings'
                      : 'Get workout reminders'}
                  </p>
                </div>
                {notificationStatus === 'granted' ? (
                  <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    On
                  </span>
                ) : notificationStatus === 'denied' ? (
                  <span className="text-red-500 text-sm">Blocked</span>
                ) : (
                  <button
                    onClick={handleEnableNotifications}
                    disabled={isRequestingNotifications}
                    className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    {isRequestingNotifications ? 'Enabling...' : 'Enable'}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Workout Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-[#2C3E50] dark:text-gray-100">Workout</h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Default Sets */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-200">Default Sets</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Number of sets when starting a new exercise</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDefaultSetsChange(defaultSets - 1)}
                  disabled={defaultSets <= 1}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    defaultSets > 1
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-8 text-center font-bold text-gray-900 dark:text-gray-100">{defaultSets}</span>
                <button
                  onClick={() => handleDefaultSetsChange(defaultSets + 1)}
                  disabled={defaultSets >= 10}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    defaultSets < 10
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Rest Timer Duration */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="mb-2">
                <p className="font-medium text-gray-700 dark:text-gray-200">Rest Timer</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Default rest duration between sets</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {TIMER_PRESETS.map(preset => (
                  <button
                    key={preset}
                    onClick={() => handleDefaultDurationChange(preset)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      defaultDuration === preset
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {formatTime(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Suggestions Toggle */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-200">Target Suggestions</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Show recommended reps/weight based on history</p>
              </div>
              <button
                onClick={handleToggleTargetSuggestions}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  showTargetSuggestions ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    showTargetSuggestions ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Training Program */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-200">Training Program</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activeRoutineName ? `Active: ${activeRoutineName}` : 'Select your workout split'}
                </p>
              </div>
              {currentProfileId ? (
                <Link
                  href={`/profile/${currentProfileId}/program`}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    activeRoutineName
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {activeRoutineName ? 'Manage' : 'Setup'}
                </Link>
              ) : (
                <span className="text-xs text-gray-400">Select a profile first</span>
              )}
            </div>

            {/* Tips & Tutorials Toggle */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex-1 mr-4">
                <p className="font-medium text-gray-700 dark:text-gray-200">Tips & Tutorials</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {tipsEnabled ? 'Show helpful tips as you explore' : 'Enable to see tips again'}
                </p>
              </div>
              <button
                onClick={handleToggleTips}
                className={`relative shrink-0 w-12 h-6 rounded-full transition-colors ${
                  tipsEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${
                    tipsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Gestures Guide */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-200">Gestures Guide</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Learn the app&apos;s hidden gestures</p>
              </div>
              <button
                onClick={() => setShowGesturesGuide(true)}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                View
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-[#2C3E50] dark:text-gray-100">About</h2>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">App</span>
              <span className="text-gray-700 dark:text-gray-200">REPPIT</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Version</span>
              <button
                onClick={handleVersionTap}
                className="text-gray-700 dark:text-gray-200 cursor-default select-none"
              >
                1.0.1{devTapCount > 0 && devTapCount < 10 && ` (${10 - devTapCount})`}
              </button>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Build</span>
              <span className="text-gray-700 dark:text-gray-200">2025.01</span>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 mt-3 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Developed by</span>
                <span className="text-gray-700 dark:text-gray-200">Castro</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                Made with care for strength enthusiasts
              </p>
            </div>
          </div>
        </section>

        {/* Developer Section - Hidden by default, unlock by tapping version 10 times */}
        {showDevMode && (
          <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-[#2C3E50] dark:text-gray-100">Developer</h2>
            </div>
            <div className="p-4 space-y-3">
              {/* Sample Data */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-200">Sample Profiles</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {hasSamples ? 'Sample profiles with workout data loaded' : 'Load demo profiles to explore the app'}
                  </p>
                </div>
                {!hasSamples ? (
                  <button
                    onClick={handleLoadSampleData}
                    className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Load
                  </button>
                ) : (
                  <button
                    onClick={handleRemoveSampleData}
                    className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Timer UI Options */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <a
                  href="/mockups/timer-options.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-sm hover:bg-gray-50 dark:hover:bg-gray-700 -mx-4 px-4 py-2 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-200">Timer UI Options</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Preview different timer designs</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Hide Developer Mode */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <button
                  onClick={() => {
                    setShowDevMode(false)
                    localStorage.removeItem('devModeUnlocked')
                  }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Hide Developer Options
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Danger Zone */}
        {user && (
          <section className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20">
              <h2 className="font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
            </div>
            <div className="p-4">
              {!showDeleteConfirm ? (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete Account
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    Are you sure? This will permanently delete:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                    <li>Your account</li>
                    <li>All profiles and strength data</li>
                    <li>All workout history</li>
                  </ul>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      fullWidth
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Privacy Link */}
        <div className="text-center pt-4">
          <a
            href="/privacy"
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            Privacy Policy
          </a>
        </div>
      </main>

      {/* Gestures Guide Modal */}
      {showGesturesGuide && (
        <GesturesOnboarding onComplete={() => setShowGesturesGuide(false)} />
      )}
    </div>
  )
}
