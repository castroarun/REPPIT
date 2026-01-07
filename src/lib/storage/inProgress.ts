import { Exercise } from '@/types'

const IN_PROGRESS_KEY = 'strength_profile_in_progress_exercise'
const IN_PROGRESS_CHANGE_EVENT = 'inProgressExerciseChange'

/**
 * Dispatch custom event for same-tab updates
 * (storage event only fires for other tabs)
 */
function dispatchChangeEvent(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(IN_PROGRESS_CHANGE_EVENT))
}

/**
 * Subscribe to in-progress exercise changes (works for same tab and cross-tab)
 */
export function onInProgressChange(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  // Listen for same-tab changes via custom event
  const handleCustomEvent = () => callback()
  window.addEventListener(IN_PROGRESS_CHANGE_EVENT, handleCustomEvent)

  // Listen for cross-tab changes via storage event
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === IN_PROGRESS_KEY) callback()
  }
  window.addEventListener('storage', handleStorageEvent)

  // Return cleanup function
  return () => {
    window.removeEventListener(IN_PROGRESS_CHANGE_EVENT, handleCustomEvent)
    window.removeEventListener('storage', handleStorageEvent)
  }
}

/**
 * Get the currently in-progress exercise ID
 * Returns null if no exercise is in progress
 */
export function getInProgressExercise(): Exercise | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem(IN_PROGRESS_KEY)
  if (!stored) return null

  try {
    const data = JSON.parse(stored)
    // Check if the stored date is today - clear if not
    const today = new Date().toISOString().split('T')[0]
    if (data.date !== today) {
      clearInProgressExercise()
      return null
    }
    return data.exerciseId as Exercise
  } catch {
    return null
  }
}

/**
 * Set an exercise as in-progress
 */
export function setInProgressExercise(exerciseId: Exercise): void {
  if (typeof window === 'undefined') return

  const today = new Date().toISOString().split('T')[0]
  localStorage.setItem(IN_PROGRESS_KEY, JSON.stringify({
    exerciseId,
    date: today
  }))
  dispatchChangeEvent()
}

/**
 * Clear the in-progress exercise
 */
export function clearInProgressExercise(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(IN_PROGRESS_KEY)
  dispatchChangeEvent()
}

/**
 * Check if a specific exercise is in progress
 */
export function isExerciseInProgress(exerciseId: Exercise): boolean {
  return getInProgressExercise() === exerciseId
}
