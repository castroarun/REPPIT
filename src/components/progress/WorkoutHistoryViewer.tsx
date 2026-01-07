'use client'

import { useState, useEffect, useRef } from 'react'
import { Exercise, WorkoutSession, WorkoutSet, BodyPart, ALL_BODY_PARTS } from '@/types'
import { getAllWorkouts, formatSessionDate } from '@/lib/storage/workouts'
import { EXERCISES } from '@/lib/calculations/strength'
import { useUnit } from '@/contexts'
import { formatWeightValue } from '@/lib/utils/units'

interface WorkoutHistoryViewerProps {
  profileId: string
  isOpen: boolean
  onClose: () => void
}

interface ExerciseHistory {
  exerciseId: Exercise
  exerciseName: string
  bodyPart: BodyPart
  sessions: WorkoutSession[]
  latestDate: string
  bestSet: { weight: number; reps: number } | null
}

export default function WorkoutHistoryViewer({ profileId, isOpen, onClose }: WorkoutHistoryViewerProps) {
  const { unit } = useUnit()
  const [exerciseHistories, setExerciseHistories] = useState<ExerciseHistory[]>([])
  const [selectedExercise, setSelectedExercise] = useState<ExerciseHistory | null>(null)
  const [filterBodyPart, setFilterBodyPart] = useState<BodyPart | 'all'>('all')
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (isOpen) {
      loadHistory()
    }
  }, [isOpen, profileId])

  const loadHistory = () => {
    const allWorkouts = getAllWorkouts().filter(w => w.profileId === profileId)

    // Group by exercise
    const exerciseMap: Record<Exercise, WorkoutSession[]> = {} as Record<Exercise, WorkoutSession[]>
    allWorkouts.forEach(session => {
      if (!exerciseMap[session.exerciseId]) {
        exerciseMap[session.exerciseId] = []
      }
      exerciseMap[session.exerciseId].push(session)
    })

    // Build history data for each exercise
    const histories: ExerciseHistory[] = []
    Object.entries(exerciseMap).forEach(([exerciseId, sessions]) => {
      const exercise = EXERCISES.find(e => e.id === exerciseId)
      if (!exercise) return

      // Sort sessions by date (newest first)
      const sortedSessions = sessions.sort((a, b) => b.date.localeCompare(a.date))

      // Find best set (highest weight with at least 1 rep)
      let bestSet: { weight: number; reps: number } | null = null
      sessions.forEach(session => {
        session.sets.forEach(set => {
          if (set.weight && set.reps && set.weight > 0 && set.reps > 0) {
            if (!bestSet || set.weight > bestSet.weight) {
              bestSet = { weight: set.weight, reps: set.reps }
            }
          }
        })
      })

      histories.push({
        exerciseId: exerciseId as Exercise,
        exerciseName: exercise.name,
        bodyPart: exercise.bodyPart,
        sessions: sortedSessions.slice(0, 10), // Last 10 sessions
        latestDate: sortedSessions[0]?.date || '',
        bestSet
      })
    })

    // Sort by latest workout date
    histories.sort((a, b) => b.latestDate.localeCompare(a.latestDate))
    setExerciseHistories(histories)
  }

  // Auto-scroll to right when exercise is selected
  useEffect(() => {
    if (selectedExercise) {
      const ref = scrollRefs.current[selectedExercise.exerciseId]
      if (ref) {
        setTimeout(() => {
          ref.scrollLeft = ref.scrollWidth
        }, 50)
      }
    }
  }, [selectedExercise])

  if (!isOpen) return null

  const filteredHistories = filterBodyPart === 'all'
    ? exerciseHistories
    : exerciseHistories.filter(h => h.bodyPart === filterBodyPart)

  const bodyPartCounts = ALL_BODY_PARTS.reduce((acc, bp) => {
    acc[bp] = exerciseHistories.filter(h => h.bodyPart === bp).length
    return acc
  }, {} as Record<BodyPart, number>)

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-lg sm:rounded-t-xl rounded-t-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">
              {selectedExercise ? selectedExercise.exerciseName : 'Workout History'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {selectedExercise && (
              <button
                onClick={() => setSelectedExercise(null)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Back
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedExercise ? (
            // Detailed view for selected exercise
            <div className="p-4">
              {/* Summary stats */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedExercise.sessions.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sessions</p>
                </div>
                {selectedExercise.bestSet && (
                  <div className="flex-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      {formatWeightValue(selectedExercise.bestSet.weight, unit)}{unit}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Best × {selectedExercise.bestSet.reps}</p>
                  </div>
                )}
              </div>

              {/* Scrollable history */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                ← Swipe to see older sessions →
              </div>
              <div
                ref={el => { scrollRefs.current[selectedExercise.exerciseId] = el }}
                className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {selectedExercise.sessions.slice().reverse().map((session, idx) => (
                  <div key={idx} className="flex-shrink-0 min-w-[80px]">
                    <div className="text-center py-1.5 mb-1">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                        {formatSessionDate(session.date)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {session.sets.map((set, setIdx) => {
                        const hasData = set.weight && set.reps
                        return (
                          <div
                            key={setIdx}
                            className="h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700/50 px-2"
                          >
                            {hasData ? (
                              <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                {formatWeightValue(set.weight!, unit)}×{set.reps}
                              </span>
                            ) : (
                              <span className="text-gray-300 dark:text-gray-600">-</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Set labels */}
              <div className="mt-3 flex flex-col gap-1.5">
                {selectedExercise.sessions[0]?.sets.map((_, idx) => (
                  <div key={idx} className="text-xs text-gray-400 dark:text-gray-500">
                    Set {idx + 1}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Exercise list view
            <>
              {/* Body part filter */}
              <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <button
                    onClick={() => setFilterBodyPart('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      filterBodyPart === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    All ({exerciseHistories.length})
                  </button>
                  {ALL_BODY_PARTS.filter(bp => bodyPartCounts[bp] > 0).map(bp => (
                    <button
                      key={bp}
                      onClick={() => setFilterBodyPart(bp)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors capitalize ${
                        filterBodyPart === bp
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {bp} ({bodyPartCounts[bp]})
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercise list */}
              {filteredHistories.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No workout history yet.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Log workouts to see your history here!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredHistories.map(history => (
                    <button
                      key={history.exerciseId}
                      onClick={() => setSelectedExercise(history)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-800 dark:text-gray-100 truncate">
                            {history.exerciseName}
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 capitalize">
                            {history.bodyPart}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {history.sessions.length} sessions
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Last: {formatSessionDate(history.latestDate)}
                          </span>
                        </div>
                      </div>
                      {history.bestSet && (
                        <div className="text-right ml-3">
                          <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                            {formatWeightValue(history.bestSet.weight, unit)}{unit}
                          </p>
                          <p className="text-xs text-gray-400">PR</p>
                        </div>
                      )}
                      <svg className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
