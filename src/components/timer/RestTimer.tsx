'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Exercise, TIMER_INCREMENT, TimerMode, getDynamicTimerPresets } from '@/types'
import {
  getTimerSettings,
  getExerciseTimerDuration,
  saveExerciseTimerDuration,
  formatTime,
  onTimerSettingsChange
} from '@/lib/storage/timer'
import { useUnit } from '@/contexts'

interface RestTimerProps {
  exerciseId?: Exercise
  exerciseName?: string
  setNumber?: number
  weight?: number
  reps?: number
  onTimerEnd?: () => void
  onExpand?: (state: { timeLeft: number; duration: number; isRunning: boolean }) => void
  autoStart?: boolean
  compact?: boolean
  initialTimeLeft?: number
  initialDuration?: number
  initialIsRunning?: boolean
}

export default function RestTimer({
  exerciseId,
  exerciseName,
  setNumber,
  weight,
  reps,
  onTimerEnd,
  onExpand,
  autoStart = false,
  compact = false,
  initialTimeLeft,
  initialDuration,
  initialIsRunning
}: RestTimerProps) {
  const { unit } = useUnit()
  const [duration, setDuration] = useState(initialDuration ?? 90)
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft ?? 90)
  const [isRunning, setIsRunning] = useState(initialIsRunning ?? false)
  const [mode, setMode] = useState<TimerMode>('countdown')
  const [hasEnded, setHasEnded] = useState(false)
  const [showWarningFlash, setShowWarningFlash] = useState(false)
  const [warningTime, setWarningTime] = useState(30)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load settings and exercise-specific duration on mount (unless initial values provided)
  useEffect(() => {
    const settings = getTimerSettings()
    setWarningTime(settings.warningTime ?? 30)

    // If we have initial values from minimize, don't override them
    if (initialTimeLeft !== undefined && initialDuration !== undefined) {
      if (initialIsRunning) {
        setIsRunning(true)
      }
      return
    }

    let loadedDuration = settings.defaultDuration

    if (exerciseId) {
      loadedDuration = getExerciseTimerDuration(exerciseId)
    }

    setDuration(loadedDuration)
    setTimeLeft(loadedDuration)

    if (autoStart && settings.autoStart) {
      setIsRunning(true)
    }
  }, [exerciseId, autoStart, initialTimeLeft, initialDuration, initialIsRunning])

  // Listen for timer settings changes (e.g., when user changes default duration in settings)
  useEffect(() => {
    const unsubscribe = onTimerSettingsChange((newSettings) => {
      // Only update if timer is not currently running
      if (!isRunning) {
        setDuration(newSettings.defaultDuration)
        setTimeLeft(newSettings.defaultDuration)
      }
      setWarningTime(newSettings.warningTime ?? 30)
    })
    return unsubscribe
  }, [isRunning])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Play alert sound - longer duration for timer completion
  const playAlert = useCallback(() => {
    const settings = getTimerSettings()

    if (settings.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200, 100, 300, 100, 400])
    }

    if (settings.soundEnabled) {
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        gainNode.gain.value = 0.4

        oscillator.start()

        // Extended melody pattern for timer end - total ~2 seconds
        setTimeout(() => { oscillator.frequency.value = 1000 }, 200)
        setTimeout(() => { oscillator.frequency.value = 1200 }, 400)
        setTimeout(() => { oscillator.frequency.value = 800 }, 600)
        setTimeout(() => { oscillator.frequency.value = 1000 }, 800)
        setTimeout(() => { oscillator.frequency.value = 1200 }, 1000)
        setTimeout(() => { oscillator.frequency.value = 1400 }, 1200)
        setTimeout(() => { oscillator.frequency.value = 1600 }, 1400)
        setTimeout(() => {
          // Fade out
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        }, 1700)
        setTimeout(() => {
          oscillator.stop()
          audioContext.close()
        }, 2000)
      } catch (e) {
        console.log('Audio not supported')
      }
    }
  }, [])

  // Play warning blip at 30 seconds remaining
  const playWarningBlip = useCallback(() => {
    const settings = getTimerSettings()

    if (settings.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }

    if (settings.soundEnabled) {
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 600
        oscillator.type = 'sine'
        gainNode.gain.value = 0.2

        oscillator.start()

        // Two quick blips
        setTimeout(() => { oscillator.frequency.value = 800 }, 100)
        setTimeout(() => { gainNode.gain.value = 0 }, 200)
        setTimeout(() => { gainNode.gain.value = 0.2 }, 300)
        setTimeout(() => { oscillator.frequency.value = 600 }, 300)
        setTimeout(() => { oscillator.frequency.value = 800 }, 400)
        setTimeout(() => {
          oscillator.stop()
          audioContext.close()
        }, 500)
      } catch (e) {
        console.log('Audio not supported')
      }
    }
  }, [])

  // Track if warning has been played
  const hasPlayedWarningRef = useRef(false)

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (mode === 'countdown') {
            const newTime = prev - 1

            // Play warning at configured time (only once, and only if duration > warningTime)
            if (warningTime > 0 && newTime === warningTime && !hasPlayedWarningRef.current && duration > warningTime) {
              hasPlayedWarningRef.current = true
              playWarningBlip()
              // Show visual flash
              setShowWarningFlash(true)
              setTimeout(() => setShowWarningFlash(false), 1000)
            }

            if (newTime <= 0 && !hasEnded) {
              setHasEnded(true)
              playAlert()
              onTimerEnd?.()
            }
            return newTime
          } else {
            return prev + 1
          }
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, mode, hasEnded, playAlert, playWarningBlip, duration, warningTime, onTimerEnd])

  const start = () => {
    setIsRunning(true)
    setHasEnded(false)
  }

  const pause = () => {
    setIsRunning(false)
  }

  const reset = () => {
    setIsRunning(false)
    setTimeLeft(duration)
    setHasEnded(false)
    hasPlayedWarningRef.current = false
  }

  const setPreset = (seconds: number) => {
    setDuration(seconds)
    setTimeLeft(seconds)
    setIsRunning(false)
    setHasEnded(false)
    hasPlayedWarningRef.current = false

    if (exerciseId) {
      saveExerciseTimerDuration(exerciseId, seconds)
    }
  }

  const adjustTime = (seconds: number) => {
    // Temporary adjustment - does NOT save to exercise memory
    const newDuration = Math.max(15, duration + seconds)
    setDuration(newDuration)
    setTimeLeft(prev => Math.max(0, prev + seconds))
  }

  const toggleMode = () => {
    if (mode === 'countdown') {
      setMode('countup')
      setTimeLeft(0)
      setDuration(0)
    } else {
      setMode('countdown')
      const settings = getTimerSettings()
      setTimeLeft(settings.defaultDuration)
      setDuration(settings.defaultDuration)
    }
    setIsRunning(false)
    setHasEnded(false)
  }

  // Handle double-click to expand - pass current state for sync
  const handleDoubleClick = () => {
    if (onExpand) {
      onExpand({ timeLeft, duration, isRunning })
    }
  }

  // Calculate progress
  const progress = mode === 'countdown' && duration > 0
    ? Math.max(0, timeLeft / duration)
    : 0

  // Format weight with unit
  const formatWeight = (w: number) => {
    return unit === 'kg' ? `${w}kg` : `${Math.round(w * 2.205)}lb`
  }

  // Determine color based on state
  const getTimerColor = () => {
    if (hasEnded || timeLeft < 0) return 'text-red-500 dark:text-red-400'
    if (timeLeft <= 10 && mode === 'countdown') return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-800 dark:text-white'
  }

  const getProgressGradient = () => {
    if (hasEnded || timeLeft < 0) return 'from-red-500 to-orange-400'
    if (timeLeft <= 10 && mode === 'countdown') return 'from-yellow-500 to-amber-400'
    return 'from-blue-500 to-cyan-400'
  }

  // Compact view for inline display
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={isRunning ? pause : start}
          className={`p-2 rounded-full ${isRunning ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}
        >
          {isRunning ? (
            <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <span className={`font-mono text-sm font-bold ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </span>
        <button
          onClick={reset}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 cursor-pointer select-none border shadow-sm relative overflow-hidden transition-all ${
        showWarningFlash
          ? 'border-yellow-400 dark:border-yellow-500 ring-2 ring-yellow-400/50'
          : 'border-gray-200 dark:border-gray-700'
      }`}
      onDoubleClick={handleDoubleClick}
      title="Double-click to expand"
    >
      {/* 30-second warning flash overlay */}
      {showWarningFlash && (
        <div className="absolute inset-0 z-10 pointer-events-none animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/30 via-orange-400/20 to-transparent rounded-xl" />
        </div>
      )}

      {/* Exercise name */}
      {exerciseName && (
        <p className="text-blue-600 dark:text-blue-400 text-xs uppercase tracking-[0.2em] text-center mb-3 font-medium">
          {exerciseName}
        </p>
      )}

      {/* Timer display */}
      <div className="flex justify-center mb-3">
        <div className={`font-mono-timer text-4xl font-bold ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar with glow effect when running */}
      {mode === 'countdown' && (
        <div className="mb-3">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getProgressGradient()} rounded-full transition-all duration-1000 ${isRunning ? 'glow-pulse' : ''}`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats row */}
      {(setNumber || weight || reps) && (
        <div className="flex justify-between mb-3 text-center">
          {setNumber && (
            <div>
              <p className="text-lg font-bold text-gray-800 dark:text-white">S{setNumber}</p>
              <p className="text-[10px] text-gray-500 uppercase">Set</p>
            </div>
          )}
          {weight !== undefined && weight > 0 && (
            <div>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatWeight(weight)}</p>
              <p className="text-[10px] text-gray-500 uppercase">Weight</p>
            </div>
          )}
          {reps !== undefined && reps > 0 && (
            <div>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{reps}</p>
              <p className="text-[10px] text-gray-500 uppercase">Reps</p>
            </div>
          )}
        </div>
      )}

      {/* Preset buttons - show 5 options around current duration */}
      {mode === 'countdown' && (
        <div className="flex justify-center gap-1 mb-3">
          {getDynamicTimerPresets(duration).map(preset => (
            <button
              key={preset}
              onClick={(e) => { e.stopPropagation(); setPreset(preset) }}
              className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                duration === preset
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {formatTime(preset)}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center items-center gap-4">
        {/* -15s button */}
        {mode === 'countdown' && (
          <button
            onClick={(e) => { e.stopPropagation(); adjustTime(-TIMER_INCREMENT) }}
            className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 text-sm font-bold hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all"
          >
            -15
          </button>
        )}

        {/* Start/Pause button */}
        <button
          onClick={(e) => { e.stopPropagation(); isRunning ? pause() : start() }}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isRunning
              ? 'bg-gradient-to-r from-orange-500 to-amber-500'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500'
          }`}
        >
          {isRunning ? (
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* +15s / Reset button */}
        {mode === 'countdown' ? (
          <button
            onClick={(e) => { e.stopPropagation(); adjustTime(TIMER_INCREMENT) }}
            className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 text-sm font-bold hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all"
          >
            +15
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); reset() }}
            className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 flex items-center justify-center transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Mode toggle */}
      <div className="flex justify-center mt-3">
        <button
          onClick={(e) => { e.stopPropagation(); toggleMode() }}
          className="text-[10px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 uppercase tracking-wider"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          {mode === 'countdown' ? 'Timer' : 'Stopwatch'}
        </button>
      </div>

      {/* Double-click hint */}
      <p className="text-[9px] text-gray-400 text-center mt-2">Double-click to expand</p>

      {/* Hidden audio element for fallback */}
      <audio ref={audioRef} preload="auto" />
    </div>
  )
}
