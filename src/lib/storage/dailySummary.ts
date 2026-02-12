import { WorkoutSession, Exercise } from '@/types'
import { getAllWorkouts, formatSessionDate, formatLocalDate } from './workouts'
import { EXERCISES } from '@/lib/calculations/strength'
import { getProfileById } from './profiles'

export interface DailySummary {
  date: string               // YYYY-MM-DD
  displayDate: string        // "Feb 10" or "TODAY"
  fullDate: string           // "Monday, Feb 10"
  exerciseCount: number
  totalSets: number
  totalVolume: number        // weight x reps in kg
  totalReps: number
  estimatedCalories: number  // estimated kcal burned from lifting
  exercises: DailyExerciseSummary[]
}

export interface DailyExerciseSummary {
  exerciseId: Exercise
  name: string
  bodyPart: string
  sets: number
  maxWeight: number
  totalVolume: number
  bestSet: { weight: number; reps: number }
}

/**
 * Estimate calories burned from weight training.
 *
 * Uses a MET-based approach:
 * - Moderate weight training MET ~ 3.5-5.0 (we use 5.0 for working sets)
 * - Formula: kcal = MET x bodyWeight(kg) x duration(hours)
 * - Estimated ~2 minutes per set (including rest between sets of that exercise)
 *
 * This is a rough estimate - actual burn depends on intensity, rest times, etc.
 */
export function estimateCaloriesBurned(
  totalSets: number,
  bodyWeightKg: number
): number {
  const MET = 5.0
  const minutesPerSet = 2 // ~30s lift + ~90s rest avg
  const totalMinutes = totalSets * minutesPerSet
  const hours = totalMinutes / 60
  const calories = MET * bodyWeightKg * hours
  return Math.round(calories)
}

/**
 * Get all unique workout dates for a profile, sorted newest first
 */
export function getWorkoutDates(profileId: string): string[] {
  const allWorkouts = getAllWorkouts().filter(w => w.profileId === profileId)
  const dates = [...new Set(allWorkouts.map(w => w.date))]
  return dates.sort((a, b) => b.localeCompare(a))
}

/**
 * Build a daily summary from workout data for a specific date
 */
export function getDailySummary(profileId: string, date: string): DailySummary | null {
  const allWorkouts = getAllWorkouts().filter(
    w => w.profileId === profileId && w.date === date
  )

  if (allWorkouts.length === 0) return null

  let totalSets = 0
  let totalVolume = 0
  let totalReps = 0
  const exercises: DailyExerciseSummary[] = []

  allWorkouts.forEach(session => {
    const exerciseInfo = EXERCISES.find(e => e.id === session.exerciseId)
    if (!exerciseInfo) return

    const validSets = session.sets.filter(s => s.weight !== null && s.reps !== null)
    const setCount = validSets.length

    let maxWeight = 0
    let sessionVolume = 0
    let sessionReps = 0
    let bestSet = { weight: 0, reps: 0 }

    validSets.forEach(set => {
      const w = set.weight || 0
      const r = set.reps || 0
      const vol = w * r
      sessionVolume += vol
      sessionReps += r
      if (w > maxWeight) {
        maxWeight = w
        bestSet = { weight: w, reps: r }
      }
    })

    totalSets += setCount
    totalVolume += sessionVolume
    totalReps += sessionReps

    if (setCount > 0) {
      exercises.push({
        exerciseId: session.exerciseId,
        name: exerciseInfo.name,
        bodyPart: exerciseInfo.bodyPart,
        sets: setCount,
        maxWeight,
        totalVolume: sessionVolume,
        bestSet
      })
    }
  })

  // Estimate calories burned
  const profile = getProfileById(profileId)
  const bodyWeight = profile?.weight || 70 // fallback 70kg
  const estimatedCalories = estimateCaloriesBurned(totalSets, bodyWeight)

  // Parse date for display
  const dateObj = new Date(date + 'T12:00:00') // noon to avoid timezone shift
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
  const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return {
    date,
    displayDate: formatSessionDate(date),
    fullDate: `${dayName}, ${monthDay}`,
    exerciseCount: exercises.length,
    totalSets,
    totalVolume: Math.round(totalVolume),
    totalReps,
    estimatedCalories,
    exercises
  }
}

/**
 * Get daily volume data for the last N workout days (for the volume progression chart)
 * Returns data sorted oldest to newest
 */
export function getDailyVolumeHistory(profileId: string, maxDays: number = 14): { date: string; displayDate: string; volume: number; sets: number }[] {
  const dates = getWorkoutDates(profileId).slice(0, maxDays)

  return dates
    .map(date => {
      const summary = getDailySummary(profileId, date)
      return {
        date,
        displayDate: formatSessionDate(date),
        volume: summary?.totalVolume || 0,
        sets: summary?.totalSets || 0
      }
    })
    .filter(d => d.volume > 0)
    .reverse() // oldest first for chart
}
