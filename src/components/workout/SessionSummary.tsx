'use client'

import { useMemo } from 'react'
import { WorkoutSession, formatSessionDuration } from '@/lib/storage/session'
import { LEVEL_COLORS, LEVEL_FULL_NAMES } from '@/types'
import { useUnit } from '@/contexts'
import { formatWeightValue } from '@/lib/utils/units'
import { estimateCaloriesBurned } from '@/lib/storage/dailySummary'

interface SessionSummaryProps {
  onClose: () => void
  session: WorkoutSession
  bodyWeightKg?: number
}

/**
 * Format time of day from ISO string
 */
function getStartTime(startTime: string): string {
  const date = new Date(startTime)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export default function SessionSummary({ onClose, session, bodyWeightKg = 70 }: SessionSummaryProps) {
  const { unit } = useUnit()

  // Calculate summary statistics
  const stats = useMemo(() => {
    const exerciseIds = Object.keys(session.exercises)
    const exerciseCount = exerciseIds.length

    let totalSets = 0
    let totalVolume = 0

    exerciseIds.forEach(exerciseId => {
      const exercise = session.exercises[exerciseId]
      // Count only non-warmup sets
      const workingSets = exercise.sets.filter(set => !set.isWarmup)
      totalSets += workingSets.length

      // Calculate volume (weight × reps)
      workingSets.forEach(set => {
        totalVolume += set.weight * set.reps
      })
    })

    return {
      duration: formatSessionDuration(session),
      startTime: getStartTime(session.startTime),
      endTime: session.lastActivityTime ? getStartTime(session.lastActivityTime) : getStartTime(session.startTime),
      exerciseCount,
      totalSets,
      totalVolume: Math.round(totalVolume),
      estimatedCalories: estimateCaloriesBurned(totalSets, bodyWeightKg)
    }
  }, [session, bodyWeightKg])

  // Check if this was a productive session (at least 1 set logged)
  const isProductive = stats.totalSets > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 rounded-t-2xl text-white flex-shrink-0">
          <div className="text-center">
            <div className="text-5xl mb-3">
              {isProductive ? '💪' : '👋'}
            </div>
            <h2 className="text-2xl font-bold mb-1">
              {isProductive ? 'Workout Complete!' : 'Session Ended'}
            </h2>
            <p className="text-blue-100 text-sm">
              {stats.startTime} — {stats.endTime}
            </p>
          </div>
        </div>

        {/* Summary Stats - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          {isProductive ? (
            <>
              {/* Main stats grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Duration */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                  <div className="text-blue-600 dark:text-blue-400 text-xs font-medium uppercase tracking-wide mb-1">
                    Duration
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.duration}
                  </div>
                </div>

                {/* Exercises */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                  <div className="text-purple-600 dark:text-purple-400 text-xs font-medium uppercase tracking-wide mb-1">
                    Exercises
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.exerciseCount}
                  </div>
                </div>

                {/* Total Sets */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                  <div className="text-green-600 dark:text-green-400 text-xs font-medium uppercase tracking-wide mb-1">
                    Total Sets
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalSets}
                  </div>
                </div>

                {/* Total Volume */}
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
                  <div className="text-orange-600 dark:text-orange-400 text-xs font-medium uppercase tracking-wide mb-1">
                    Total Volume
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatWeightValue(stats.totalVolume, unit)}
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{unit}</span>
                  </div>
                </div>
              </div>

              {/* Estimated Calories */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <span className="text-red-600 dark:text-red-400 text-xs font-medium uppercase tracking-wide">
                    Est. Calories Burned
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.estimatedCalories}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">kcal</span>
                </div>
              </div>

              {/* Exercises Breakdown */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                  Exercises Trained
                </h3>
                <div className="space-y-2">
                  {Object.keys(session.exercises).map(exerciseId => {
                    const exercise = session.exercises[exerciseId]
                    const workingSets = exercise.sets.filter(set => !set.isWarmup)
                    const setCount = workingSets.length
                    const maxWeight = Math.max(...workingSets.map(s => s.weight))

                    return (
                      <div
                        key={exerciseId}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                      >
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {exercise.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {setCount} set{setCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {formatWeightValue(maxWeight, unit)}{unit}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            max
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* PRs Achieved */}
              {session.prsAchieved.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    Personal Records
                  </h3>
                  <div className="space-y-2">
                    {session.prsAchieved.map((pr, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {pr.exerciseName}
                            </div>
                            <div className="text-xs text-yellow-700 dark:text-yellow-400">
                              New personal best!
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                              {formatWeightValue(pr.weight, unit)}{unit}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              × {pr.reps} reps
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Level Ups */}
              {session.levelUps.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <span className="text-lg">🚀</span>
                    Level Progress
                  </h3>
                  <div className="space-y-2">
                    {session.levelUps.map((levelUp, index) => {
                      const levelName = LEVEL_FULL_NAMES[levelUp.newLevel as keyof typeof LEVEL_FULL_NAMES] || levelUp.newLevel
                      const levelColor = LEVEL_COLORS[levelUp.newLevel as keyof typeof LEVEL_COLORS] || '#666'

                      return (
                        <div
                          key={index}
                          className="rounded-lg p-3 border-2"
                          style={{
                            backgroundColor: `${levelColor}15`,
                            borderColor: levelColor
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {levelUp.exerciseName}
                            </div>
                            <div
                              className="px-3 py-1 rounded-full text-sm font-bold text-white"
                              style={{ backgroundColor: levelColor }}
                            >
                              {levelName}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Motivational message */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  {session.prsAchieved.length > 0 || session.levelUps.length > 0
                    ? "Outstanding work! You're getting stronger every day! 💯"
                    : "Great session! Consistency is the key to progress! 🔥"}
                </p>
              </div>
            </>
          ) : (
            /* No sets logged */
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No sets were logged during this session.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Duration: {stats.duration}
              </p>
            </div>
          )}
        </div>

        {/* Done button - Fixed at bottom */}
        <div className="p-6 pt-0 flex-shrink-0 bg-white dark:bg-gray-900 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
