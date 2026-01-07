'use client'

import { useState, useEffect } from 'react'
import { areTipsEnabled } from '@/lib/storage/onboarding'

export type TipId =
  | 'program_intro'
  | 'profile_gestures'
  | 'progress_calendar'
  | 'workout_log'
  | 'profile_settings'
  | 'profile_tap_exercise'
  | 'workout_timer_settings'
  | 'timer_settings'
  | 'training_program_setup'

interface ContextualTipProps {
  tipId: TipId
  title: string
  message: string
  icon?: string
  position?: 'top' | 'bottom'
  onDismiss?: () => void
  showAfterTip?: TipId // Only show this tip after another tip has been seen
}

const TIP_STORAGE_KEY = 'strength_profile_tips_seen'

function getSeenTips(): TipId[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(TIP_STORAGE_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

function markTipSeen(tipId: TipId): void {
  if (typeof window === 'undefined') return
  const seen = getSeenTips()
  if (!seen.includes(tipId)) {
    seen.push(tipId)
    localStorage.setItem(TIP_STORAGE_KEY, JSON.stringify(seen))
  }
}

export function hasSeenTip(tipId: TipId): boolean {
  return getSeenTips().includes(tipId)
}

export function resetAllTips(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TIP_STORAGE_KEY)
}

export default function ContextualTip({
  tipId,
  title,
  message,
  icon = '💡',
  position = 'top',
  onDismiss
}: ContextualTipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Function to check and show tip
    const checkAndShowTip = () => {
      if (areTipsEnabled() && !hasSeenTip(tipId) && !isVisible) {
        setTimeout(() => {
          setIsVisible(true)
          setIsAnimating(true)
        }, 500)
      }
    }

    // Check on mount
    checkAndShowTip()

    // Also poll periodically to catch when tips are re-enabled in settings
    // This handles same-tab navigation where visibility doesn't change
    const intervalId = setInterval(() => {
      if (!isVisible && areTipsEnabled() && !hasSeenTip(tipId)) {
        setIsVisible(true)
        setIsAnimating(true)
      }
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [tipId, isVisible])

  const handleDismiss = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      markTipSeen(tipId)
      onDismiss?.()
    }, 200)
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed ${position === 'top' ? 'top-20' : 'bottom-24'} left-4 right-4 z-[90] max-w-md mx-auto transition-all duration-200 ${
        isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="bg-blue-50 dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-500 rounded-xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">
              {title}
            </h4>
            <p className="text-xs text-blue-700 dark:text-gray-200 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 transition-colors p-1"
            aria-label="Dismiss tip"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="mt-3 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  )
}
