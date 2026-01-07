const ONBOARDING_KEY = 'strength_profile_onboarding'

interface OnboardingState {
  hasSeenGestures: boolean
  hasSeenWorkoutRoutines: boolean
  tipsEnabled: boolean // Master switch for all tips/tutorials
  version: number // For future onboarding updates
}

const DEFAULT_STATE: OnboardingState = {
  hasSeenGestures: false,
  hasSeenWorkoutRoutines: false,
  tipsEnabled: true, // Tips are ON by default for new users
  version: 1
}

/**
 * Get onboarding state from localStorage
 */
export function getOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') return DEFAULT_STATE

  const stored = localStorage.getItem(ONBOARDING_KEY)
  if (!stored) return DEFAULT_STATE

  try {
    return { ...DEFAULT_STATE, ...JSON.parse(stored) }
  } catch {
    return DEFAULT_STATE
  }
}

/**
 * Save onboarding state to localStorage
 */
function saveOnboardingState(state: OnboardingState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state))
}

/**
 * Mark gestures onboarding as complete
 */
export function markGesturesOnboardingComplete(): void {
  const state = getOnboardingState()
  state.hasSeenGestures = true
  saveOnboardingState(state)
}

/**
 * Mark workout routines onboarding as complete
 */
export function markWorkoutRoutinesOnboardingComplete(): void {
  const state = getOnboardingState()
  state.hasSeenWorkoutRoutines = true
  saveOnboardingState(state)
}

/**
 * Check if user needs to see gestures onboarding
 * Returns false if tips are disabled
 */
export function needsGesturesOnboarding(): boolean {
  const state = getOnboardingState()
  return state.tipsEnabled && !state.hasSeenGestures
}

/**
 * Check if user needs to see workout routines onboarding
 * Returns false if tips are disabled
 */
export function needsWorkoutRoutinesOnboarding(): boolean {
  const state = getOnboardingState()
  return state.tipsEnabled && !state.hasSeenWorkoutRoutines
}

/**
 * Reset all onboarding (for testing)
 */
export function resetOnboarding(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ONBOARDING_KEY)
}

/**
 * Check if tips are enabled
 */
export function areTipsEnabled(): boolean {
  return getOnboardingState().tipsEnabled
}

/**
 * Skip all tips - marks onboarding complete and disables future tips
 */
export function skipAllTips(): void {
  const state = getOnboardingState()
  state.hasSeenGestures = true
  state.hasSeenWorkoutRoutines = true
  state.tipsEnabled = false
  saveOnboardingState(state)
}

/**
 * Enable tips
 */
export function enableTips(): void {
  const state = getOnboardingState()
  state.tipsEnabled = true
  saveOnboardingState(state)
}

/**
 * Disable tips
 */
export function disableTips(): void {
  const state = getOnboardingState()
  state.tipsEnabled = false
  saveOnboardingState(state)
}
