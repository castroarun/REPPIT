import { Exercise } from '@/types'

const SESSION_KEY = 'strength_profile_workout_session'

export interface WorkoutSession {
  startTime: string  // ISO date string
  lastActivityTime: string  // ISO date string - updated on each set
  exercises: {
    [exerciseId: string]: {
      name: string
      sets: Array<{ weight: number; reps: number; isWarmup?: boolean; timestamp?: string }>
    }
  }
  prsAchieved: Array<{ exerciseId: string; exerciseName: string; weight: number; reps: number }>
  levelUps: Array<{ exerciseId: string; exerciseName: string; newLevel: string }>
}

// Inactivity threshold for showing "continue?" prompt (in minutes)
export const INACTIVITY_THRESHOLD_MINUTES = 20

// Auto-end threshold: 2 hours without activity = session is stale
export const AUTO_END_THRESHOLD_MINUTES = 120

/**
 * Check if a session is from today
 */
function isSessionFromToday(session: WorkoutSession): boolean {
  const sessionDate = new Date(session.startTime).toDateString()
  const today = new Date().toDateString()
  return sessionDate === today
}

/**
 * Check if session is stale (over 2 hours since last activity OR from a different day)
 */
export function isSessionStale(session: WorkoutSession): boolean {
  // If session is from a different day, it's stale
  if (!isSessionFromToday(session)) {
    return true
  }

  // If more than 2 hours since last activity, it's stale
  const lastActivity = new Date(session.lastActivityTime).getTime()
  const now = Date.now()
  const minutesSinceActivity = (now - lastActivity) / 60000
  return minutesSinceActivity >= AUTO_END_THRESHOLD_MINUTES
}

/**
 * Get current workout session from localStorage
 * Automatically clears stale sessions (from previous days or >2 hours old)
 */
export function getSession(): WorkoutSession | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem(SESSION_KEY)
  if (!stored) return null

  try {
    const session = JSON.parse(stored) as WorkoutSession

    // Auto-clear stale sessions
    if (isSessionStale(session)) {
      // Session is stale - clear it
      localStorage.removeItem(SESSION_KEY)
      return null
    }

    return session
  } catch {
    return null
  }
}

/**
 * Get session without auto-clearing (for showing summary of stale sessions)
 */
export function getSessionRaw(): WorkoutSession | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem(SESSION_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

/**
 * Save workout session to localStorage
 */
function saveSession(session: WorkoutSession): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

/**
 * Check if there is an active workout session
 */
export function hasActiveSession(): boolean {
  return getSession() !== null
}

/**
 * Start a new workout session (records timestamp when first set is logged)
 * If session already exists, returns existing session without modification
 */
export function startSession(): WorkoutSession {
  const existing = getSession()
  if (existing) return existing

  const now = new Date().toISOString()
  const newSession: WorkoutSession = {
    startTime: now,
    lastActivityTime: now,
    exercises: {},
    prsAchieved: [],
    levelUps: []
  }

  saveSession(newSession)
  return newSession
}

/**
 * Add a set to the current session
 * Auto-starts session if not already active
 */
export function addSetToSession(
  exerciseId: Exercise,
  exerciseName: string,
  weight: number,
  reps: number,
  isWarmup?: boolean
): void {
  let session = getSession()

  // Auto-start session if not active
  if (!session) {
    session = startSession()
  }

  const now = new Date().toISOString()

  // Initialize exercise if not exists
  if (!session.exercises[exerciseId]) {
    session.exercises[exerciseId] = {
      name: exerciseName,
      sets: []
    }
  }

  // Add the set with timestamp
  session.exercises[exerciseId].sets.push({ weight, reps, isWarmup, timestamp: now })

  // Update last activity time
  session.lastActivityTime = now

  saveSession(session)
}

/**
 * Record a PR achieved during the session
 */
export function recordPR(
  exerciseId: Exercise,
  exerciseName: string,
  weight: number,
  reps: number
): void {
  const session = getSession()
  if (!session) return

  // Check if this PR is already recorded
  const alreadyRecorded = session.prsAchieved.some(
    pr => pr.exerciseId === exerciseId && pr.weight === weight
  )

  if (!alreadyRecorded) {
    session.prsAchieved.push({ exerciseId, exerciseName, weight, reps })
    saveSession(session)
  }
}

/**
 * Record a level up achieved during the session
 */
export function recordLevelUp(
  exerciseId: Exercise,
  exerciseName: string,
  newLevel: string
): void {
  const session = getSession()
  if (!session) return

  // Check if this level up is already recorded for this exercise
  const alreadyRecorded = session.levelUps.some(
    levelUp => levelUp.exerciseId === exerciseId
  )

  if (!alreadyRecorded) {
    session.levelUps.push({ exerciseId, exerciseName, newLevel })
    saveSession(session)
  } else {
    // Update existing level up to the latest level
    const index = session.levelUps.findIndex(
      levelUp => levelUp.exerciseId === exerciseId
    )
    if (index >= 0) {
      session.levelUps[index].newLevel = newLevel
      saveSession(session)
    }
  }
}

/**
 * End the current session and return summary data
 * Does not clear the session - call clearSession() after user dismisses summary
 */
export function endSession(): WorkoutSession | null {
  return getSession()
}

/**
 * Clear the current session
 * Call this after the user has viewed and dismissed the summary
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

/**
 * Get the actual workout duration (from start to last activity)
 * Returns duration in milliseconds
 */
export function getSessionDuration(): number {
  const session = getSession()
  if (!session) return 0

  const start = new Date(session.startTime).getTime()
  const end = new Date(session.lastActivityTime).getTime()
  return end - start
}

/**
 * Get minutes since last activity
 */
export function getMinutesSinceLastActivity(): number {
  const session = getSession()
  if (!session) return 0

  const lastActivity = new Date(session.lastActivityTime).getTime()
  const now = Date.now()
  return Math.floor((now - lastActivity) / 60000)
}

/**
 * Check if the session is inactive (no activity for INACTIVITY_THRESHOLD_MINUTES)
 */
export function isSessionInactive(): boolean {
  const session = getSession()
  if (!session) return false

  return getMinutesSinceLastActivity() >= INACTIVITY_THRESHOLD_MINUTES
}

/**
 * Format session duration for display
 * Uses lastActivityTime as end time for accurate duration
 */
export function formatSessionDuration(session: WorkoutSession): string {
  const start = new Date(session.startTime).getTime()
  const end = new Date(session.lastActivityTime).getTime()
  const durationMs = end - start

  const hours = Math.floor(durationMs / 3600000)
  const minutes = Math.floor((durationMs % 3600000) / 60000)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Check for stale session and return it for summary display
 * Returns the stale session if found, then clears it
 * Call this on app load to show yesterday's workout summary
 */
export function checkForStaleSession(): WorkoutSession | null {
  const session = getSessionRaw()
  if (!session) return null

  // Check if it's stale
  if (isSessionStale(session)) {
    // Only return if there was actual workout data
    const hasWorkoutData = Object.keys(session.exercises).length > 0

    // Clear the stale session
    clearSession()

    // Return for summary display if it had data
    return hasWorkoutData ? session : null
  }

  return null
}
