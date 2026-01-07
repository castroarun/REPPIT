'use client'

import { BodyPart, ALL_BODY_PARTS, BODY_PART_NAMES, Exercise } from '@/types'
import { WorkoutDay } from '@/lib/storage/routines'

export type FilterMode = 'bodyPart' | 'program'

interface BodyPartFilterProps {
  selected: BodyPart | 'all'
  onChange: (bodyPart: BodyPart | 'all') => void
  // Program mode props
  mode: FilterMode
  onModeChange: (mode: FilterMode) => void
  workoutDays?: WorkoutDay[]
  selectedDayIndex?: number
  onDayChange?: (index: number) => void
  hasProgram?: boolean
}

export default function BodyPartFilter({
  selected,
  onChange,
  mode,
  onModeChange,
  workoutDays = [],
  selectedDayIndex = 0,
  onDayChange,
  hasProgram = false
}: BodyPartFilterProps) {
  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => onModeChange('bodyPart')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            mode === 'bodyPart'
              ? 'bg-[#3498DB] text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          By Body Part
        </button>
        <button
          onClick={() => onModeChange('program')}
          disabled={!hasProgram}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            mode === 'program'
              ? 'bg-[#3498DB] text-white shadow-sm'
              : hasProgram
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
          title={!hasProgram ? 'No program selected. Go to Settings → Training Program to configure.' : undefined}
        >
          By Program
        </button>
      </div>

      {/* Body Part Pills (when bodyPart mode) */}
      {mode === 'bodyPart' && (
        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          <div className="flex gap-2 min-w-max">
            <FilterButton
              label="All"
              isSelected={selected === 'all'}
              onClick={() => onChange('all')}
            />
            {ALL_BODY_PARTS.map(bodyPart => (
              <FilterButton
                key={bodyPart}
                label={BODY_PART_NAMES[bodyPart]}
                isSelected={selected === bodyPart}
                onClick={() => onChange(bodyPart)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Workout Day Tabs (when program mode) */}
      {mode === 'program' && hasProgram && workoutDays.length > 0 && (
        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          <div className="flex gap-2 min-w-max">
            {workoutDays.map((day, index) => (
              <FilterButton
                key={index}
                label={`Day ${index + 1} - ${day.name}`}
                isSelected={selectedDayIndex === index}
                onClick={() => onDayChange?.(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Program Message */}
      {mode === 'program' && !hasProgram && (
        <div className="text-center py-3 px-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            No training program configured. Go to Settings → Training Program to select one.
          </p>
        </div>
      )}
    </div>
  )
}

interface FilterButtonProps {
  label: string
  isSelected: boolean
  onClick: () => void
}

function FilterButton({ label, isSelected, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium transition-colors
        whitespace-nowrap min-h-[36px]
        ${isSelected
          ? 'bg-[#3498DB] text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }
      `}
    >
      {label}
    </button>
  )
}
