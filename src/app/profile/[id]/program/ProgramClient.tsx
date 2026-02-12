'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Profile } from '@/types'
import { getProfileById } from '@/lib/storage/profiles'
import {
  getAllRoutines,
  getSelectedRoutineId,
  setSelectedRoutine,
  clearSelectedRoutine,
  WorkoutRoutine,
  getRoutineExercises,
  toggleRoutineExercise,
  initializeRoutineExercises,
  getRoutineExtraExercises,
  addExerciseToRoutineDay,
  removeExerciseFromRoutineDay
} from '@/lib/storage/routines'
import { Exercise, BodyPart } from '@/types'
import { EXERCISES } from '@/lib/calculations/strength'
import { ThemeToggle, UnitToggle, Logo } from '@/components/ui'
import { ContextualTip } from '@/components/onboarding'

interface ProgramClientProps {
  params: Promise<{ id: string }>
}

export default function ProgramClient({ params }: ProgramClientProps) {
  const { id } = use(params)
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([])
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null)
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null)
  // Store exercises per routine in component state (mirrors localStorage)
  const [routineExercises, setRoutineExercises] = useState<Record<string, Exercise[]>>({})
  // Extra exercises added by user per routine (keyed by routine id → day index → exercises)
  const [extraExercises, setExtraExercises] = useState<Record<string, Record<number, Exercise[]>>>({})
  // Exercise picker state: { routineId, dayIndex } or null
  const [pickerTarget, setPickerTarget] = useState<{ routineId: string; dayIndex: number } | null>(null)

  useEffect(() => {
    const loadedProfile = getProfileById(id)
    setProfile(loadedProfile)
    const allRoutines = getAllRoutines()
    setRoutines(allRoutines)
    setActiveRoutineId(getSelectedRoutineId())

    // Load exercises and extras for all routines
    const exercisesMap: Record<string, Exercise[]> = {}
    const extrasMap: Record<string, Record<number, Exercise[]>> = {}
    allRoutines.forEach(routine => {
      exercisesMap[routine.id] = getRoutineExercises(routine.id)
      extrasMap[routine.id] = getRoutineExtraExercises(routine.id)
    })
    setRoutineExercises(exercisesMap)
    setExtraExercises(extrasMap)
    setIsLoading(false)
  }, [id])

  // Activate a routine (makes it the current active routine)
  const handleActivateRoutine = (routineId: string) => {
    if (activeRoutineId === routineId) {
      // Deactivate
      clearSelectedRoutine()
      setActiveRoutineId(null)
    } else {
      setSelectedRoutine(routineId)
      setActiveRoutineId(routineId)
      // Initialize default exercises if none exist for this routine
      const routine = routines.find(r => r.id === routineId)
      if (routine) {
        const exercises = initializeRoutineExercises(routine)
        setRoutineExercises(prev => ({ ...prev, [routineId]: exercises }))
      }
    }
  }

  // Toggle exercise for a specific routine (not necessarily the active one)
  const handleToggleExercise = (routineId: string, exerciseId: Exercise) => {
    const updated = toggleRoutineExercise(routineId, exerciseId)
    setRoutineExercises(prev => ({ ...prev, [routineId]: updated }))
  }

  // Add an exercise from the full library to a routine day
  const handleAddExercise = (routineId: string, dayIndex: number, exerciseId: Exercise) => {
    const updated = addExerciseToRoutineDay(routineId, dayIndex, exerciseId)
    setExtraExercises(prev => ({ ...prev, [routineId]: updated }))
    // Refresh selected exercises since addExerciseToRoutineDay also toggles it on
    setRoutineExercises(prev => ({
      ...prev,
      [routineId]: getRoutineExercises(routineId)
    }))
  }

  // Remove a user-added exercise from a routine day
  const handleRemoveExercise = (routineId: string, dayIndex: number, exerciseId: Exercise) => {
    const updated = removeExerciseFromRoutineDay(routineId, dayIndex, exerciseId)
    setExtraExercises(prev => ({ ...prev, [routineId]: updated }))
  }

  const toggleExpand = (routineId: string) => {
    if (expandedRoutine !== routineId) {
      // When expanding, initialize exercises if none exist
      const routine = routines.find(r => r.id === routineId)
      if (routine && (!routineExercises[routineId] || routineExercises[routineId].length === 0)) {
        const exercises = initializeRoutineExercises(routine)
        setRoutineExercises(prev => ({ ...prev, [routineId]: exercises }))
      }
    }
    setExpandedRoutine(expandedRoutine === routineId ? null : routineId)
  }

  const getExerciseName = (exerciseId: string): string => {
    const exercise = EXERCISES.find(e => e.id === exerciseId)
    return exercise?.name || exerciseId
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-lg font-semibold text-[#2C3E50] mb-2">
          Profile not found
        </h2>
        <Link href="/" className="text-blue-500 hover:underline">
          Back to Profiles
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-[#2C3E50] text-white px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="text-white hover:text-gray-300 -ml-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <Logo size="sm" showText={false} />
          </div>

          {/* Center: Title */}
          <h1 className="text-lg font-semibold">Training Program</h1>

          {/* Right: Toggles */}
          <div className="flex items-center gap-2">
            <UnitToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 max-w-lg mx-auto">
        {/* Intro */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select a training program to organize your workouts. The app will suggest exercises based on your program&apos;s schedule.
          </p>
        </div>

        {/* Current Selection */}
        {activeRoutineId && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">
                Active: {routines.find(r => r.id === activeRoutineId)?.name}
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-500 mt-2 pl-7">
              {(routineExercises[activeRoutineId] || []).length} exercise{(routineExercises[activeRoutineId] || []).length !== 1 ? 's' : ''} selected • Expand routine to customize
            </p>
          </div>
        )}

        {/* Routines List */}
        <div className="space-y-3">
          {routines.map(routine => {
            const isActive = activeRoutineId === routine.id
            const isExpanded = expandedRoutine === routine.id
            const exercises = routineExercises[routine.id] || []

            return (
              <div
                key={routine.id}
                className={`bg-white dark:bg-gray-800 rounded-lg border overflow-hidden transition-all ${
                  isActive
                    ? 'border-green-500 dark:border-green-600 ring-1 ring-green-500/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Routine Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#2C3E50] dark:text-gray-100 truncate">
                          {routine.name}
                        </h3>
                        {routine.isCustom && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                            Custom
                          </span>
                        )}
                        {isActive && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {routine.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {routine.daysPerWeek} days/week
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          {routine.days.length} workouts
                        </span>
                        {exercises.length > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {exercises.length} selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expand/Collapse */}
                  <button
                    onClick={() => toggleExpand(routine.id)}
                    className="mt-3 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {isExpanded ? 'Hide details' : 'View & customize'}
                  </button>
                </div>

                {/* Expanded: Workout Days + Activate Toggle */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
                    {/* Activate Toggle */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div>
                        <p className="text-sm font-medium text-[#2C3E50] dark:text-gray-200">
                          Use this program
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isActive ? 'Currently active for filtering' : 'Activate to filter exercises by workout day'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleActivateRoutine(routine.id)}
                        className={`relative shrink-0 w-12 h-6 rounded-full transition-colors ${
                          isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${
                            isActive ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Workout Days */}
                    <div className="space-y-3">
                      {routine.days.map((day, index) => {
                        const dayExtras = (extraExercises[routine.id] || {})[index] || []
                        return (
                          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                            <h4 className="font-medium text-sm text-[#2C3E50] dark:text-gray-200 mb-2">
                              {day.name}
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {/* Predefined exercises */}
                              {day.exercises.map((exerciseId, exIndex) => {
                                const isExerciseSelected = exercises.includes(exerciseId)
                                return (
                                  <button
                                    key={exIndex}
                                    onClick={() => handleToggleExercise(routine.id, exerciseId)}
                                    className={`text-xs px-2 py-1 rounded transition-all ${
                                      isExerciseSelected
                                        ? 'bg-green-500 text-white shadow-sm'
                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
                                    }`}
                                  >
                                    {getExerciseName(exerciseId)}
                                  </button>
                                )
                              })}

                              {/* User-added exercises */}
                              {dayExtras.map((exerciseId) => {
                                const isExerciseSelected = exercises.includes(exerciseId)
                                return (
                                  <span key={`extra-${exerciseId}`} className="relative group">
                                    <button
                                      onClick={() => handleToggleExercise(routine.id, exerciseId)}
                                      className={`text-xs px-2 py-1 rounded transition-all border border-dashed ${
                                        isExerciseSelected
                                          ? 'bg-green-500 text-white border-green-600 shadow-sm'
                                          : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-500'
                                      }`}
                                    >
                                      {getExerciseName(exerciseId)}
                                    </button>
                                    <button
                                      onClick={() => handleRemoveExercise(routine.id, index, exerciseId)}
                                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Remove"
                                    >
                                      x
                                    </button>
                                  </span>
                                )
                              })}

                              {/* Add exercise button */}
                              <button
                                onClick={() => setPickerTarget({ routineId: routine.id, dayIndex: index })}
                                className="text-xs px-2 py-1 rounded border border-dashed border-blue-400 dark:border-blue-500 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              >
                                + Add
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center italic">
                      Tap exercises to toggle selection • Your choices are saved
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Create Custom (Coming Soon) */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Create Custom Program
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Coming soon
            </p>
          </div>
        </div>
      </main>

      {/* Contextual Tip */}
      <ContextualTip
        tipId="program_intro"
        title="Choose Your Training Split"
        message="Select a program and tap the exercises to customize which ones you want to track. Green = selected, grey = skipped."
        icon="🏋️"
        position="bottom"
      />

      {/* Exercise Picker Modal */}
      {pickerTarget && (() => {
        const targetRoutine = routines.find(r => r.id === pickerTarget.routineId)
        if (!targetRoutine) return null
        const targetDay = targetRoutine.days[pickerTarget.dayIndex]
        const dayExtras = (extraExercises[pickerTarget.routineId] || {})[pickerTarget.dayIndex] || []
        const alreadyInDay = [...targetDay.exercises, ...dayExtras]

        // Group available exercises by body part
        const bodyParts: BodyPart[] = ['chest', 'back', 'shoulders', 'legs', 'arms', 'core']
        const grouped = bodyParts.map(bp => ({
          bodyPart: bp,
          label: bp.charAt(0).toUpperCase() + bp.slice(1),
          exercises: EXERCISES.filter(e => e.bodyPart === bp && !alreadyInDay.includes(e.id))
        })).filter(g => g.exercises.length > 0)

        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setPickerTarget(null)}
            />
            {/* Modal */}
            <div className="relative w-full max-w-md max-h-[75vh] bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="font-semibold text-[#2C3E50] dark:text-gray-100">Add Exercise</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    to {targetDay.name}
                  </p>
                </div>
                <button
                  onClick={() => setPickerTarget(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Exercise list by body part */}
              <div className="overflow-y-auto p-4 space-y-4">
                {grouped.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    All exercises are already added to this day.
                  </p>
                ) : (
                  grouped.map(group => (
                    <div key={group.bodyPart}>
                      <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                        {group.label}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {group.exercises.map(exercise => (
                          <button
                            key={exercise.id}
                            onClick={() => {
                              handleAddExercise(pickerTarget.routineId, pickerTarget.dayIndex, exercise.id)
                              // Keep modal open so user can add multiple
                            }}
                            className="text-xs px-2.5 py-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {exercise.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setPickerTarget(null)}
                  className="w-full py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
