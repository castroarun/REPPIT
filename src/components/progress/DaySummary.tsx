'use client'

import { useState, useMemo, useCallback } from 'react'
import { useUnit } from '@/contexts'
import { formatWeightValue } from '@/lib/utils/units'
import { BODY_PART_NAMES, BodyPart } from '@/types'
import {
  getWorkoutDates,
  getDailySummary,
  getDailyVolumeHistory,
  DailySummary as DailySummaryData
} from '@/lib/storage/dailySummary'
import { formatSessionDate } from '@/lib/storage/workouts'

interface DaySummaryProps {
  profileId: string
  isOpen: boolean
  onClose: () => void
  initialDate?: string // YYYY-MM-DD to start on a specific day
}

const BODY_PART_COLORS: Record<string, string> = {
  chest: '#EF4444',
  back: '#3B82F6',
  shoulders: '#F59E0B',
  legs: '#22C55E',
  arms: '#8B5CF6',
  core: '#EC4899'
}

export default function DaySummary({ profileId, isOpen, onClose, initialDate }: DaySummaryProps) {
  const { unit } = useUnit()
  const workoutDates = useMemo(() => getWorkoutDates(profileId), [profileId])
  const volumeHistory = useMemo(() => getDailyVolumeHistory(profileId, 14), [profileId])

  // Find initial index
  const initialIndex = useMemo(() => {
    if (initialDate) {
      const idx = workoutDates.indexOf(initialDate)
      return idx >= 0 ? idx : 0
    }
    return 0
  }, [initialDate, workoutDates])

  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const currentDate = workoutDates[currentIndex]
  const summary = useMemo(
    () => (currentDate ? getDailySummary(profileId, currentDate) : null),
    [profileId, currentDate]
  )

  const canGoNewer = currentIndex > 0
  const canGoOlder = currentIndex < workoutDates.length - 1

  const goNewer = useCallback(() => {
    if (canGoNewer) setCurrentIndex(prev => prev - 1)
  }, [canGoNewer])

  const goOlder = useCallback(() => {
    if (canGoOlder) setCurrentIndex(prev => prev + 1)
  }, [canGoOlder])

  if (!isOpen) return null

  if (workoutDates.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📊</div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">No Workout Data</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start logging workouts to see your daily summaries here.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full mt-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-3 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col">
        {/* Header with date navigation */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 rounded-t-2xl text-white flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-sm font-semibold uppercase tracking-wider">Day Summary</h2>
            <div className="w-5" />
          </div>

          {/* Date navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={goOlder}
              disabled={!canGoOlder}
              className={`p-2 rounded-full transition-colors ${canGoOlder ? 'hover:bg-white/20' : 'opacity-30 cursor-not-allowed'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center">
              <div className="text-xl font-bold">{summary?.displayDate || 'No Data'}</div>
              <div className="text-xs text-white/80">{summary?.fullDate}</div>
              <div className="text-[10px] text-white/60 mt-0.5">
                {currentIndex + 1} of {workoutDates.length} workout days
              </div>
            </div>

            <button
              onClick={goNewer}
              disabled={!canGoNewer}
              className={`p-2 rounded-full transition-colors ${canGoNewer ? 'hover:bg-white/20' : 'opacity-30 cursor-not-allowed'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - scrollable */}
        <div className="p-4 overflow-y-auto flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          {summary ? (
            <>
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                <StatCard label="Exercises" value={summary.exerciseCount} color="bg-purple-50 dark:bg-purple-900/20" textColor="text-purple-600 dark:text-purple-400" />
                <StatCard label="Sets" value={summary.totalSets} color="bg-green-50 dark:bg-green-900/20" textColor="text-green-600 dark:text-green-400" />
                <StatCard label="Reps" value={summary.totalReps} color="bg-blue-50 dark:bg-blue-900/20" textColor="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <StatCard label="Volume" value={`${formatWeightValue(summary.totalVolume, unit)}`} suffix={unit} color="bg-orange-50 dark:bg-orange-900/20" textColor="text-orange-600 dark:text-orange-400" />
                <StatCard label="Est. Calories" value={summary.estimatedCalories} suffix="kcal" color="bg-red-50 dark:bg-red-900/20" textColor="text-red-500 dark:text-red-400" />
              </div>

              {/* Comparison with previous day */}
              {canGoOlder && <DayComparison profileId={profileId} currentDate={currentDate} previousDate={workoutDates[currentIndex + 1]} unit={unit} />}

              {/* Exercises breakdown */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Exercises Trained
                </h3>
                <div className="space-y-2">
                  {summary.exercises.map(ex => (
                    <div
                      key={ex.exerciseId}
                      className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                    >
                      <div
                        className="w-1 h-10 rounded-full flex-shrink-0"
                        style={{ backgroundColor: BODY_PART_COLORS[ex.bodyPart] || '#6B7280' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                          {ex.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {ex.sets} sets &middot; {BODY_PART_NAMES[ex.bodyPart as BodyPart] || ex.bodyPart}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {formatWeightValue(ex.maxWeight, unit)}{unit}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          best: {formatWeightValue(ex.bestSet.weight, unit)}{unit} x {ex.bestSet.reps}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body part distribution */}
              <BodyPartDistribution exercises={summary.exercises} />

              {/* Volume Trend (last 14 workout days) */}
              {volumeHistory.length >= 2 && (
                <VolumeTrendChart data={volumeHistory} currentDate={currentDate} unit={unit} />
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No data for this date.</p>
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="p-4 pt-0 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Sub-components ---

function StatCard({ label, value, suffix, color, textColor }: {
  label: string
  value: string | number
  suffix?: string
  color: string
  textColor: string
}) {
  return (
    <div className={`${color} rounded-lg p-2 text-center`}>
      <div className={`text-[10px] font-medium uppercase tracking-wide mb-0.5 ${textColor}`}>
        {label}
      </div>
      <div className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
        {value}
      </div>
      {suffix && (
        <div className="text-[10px] text-gray-400">{suffix}</div>
      )}
    </div>
  )
}

function DayComparison({ profileId, currentDate, previousDate, unit }: {
  profileId: string
  currentDate: string
  previousDate: string
  unit: 'kg' | 'lbs'
}) {
  const current = useMemo(() => getDailySummary(profileId, currentDate), [profileId, currentDate])
  const previous = useMemo(() => getDailySummary(profileId, previousDate), [profileId, previousDate])

  if (!current || !previous) return null

  const volumeDiff = current.totalVolume - previous.totalVolume
  const setsDiff = current.totalSets - previous.totalSets

  // Don't show if differences are trivial
  if (volumeDiff === 0 && setsDiff === 0) return null

  return (
    <div className="mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        vs {formatSessionDate(previousDate)}
      </span>
      <div className="flex gap-3">
        {volumeDiff !== 0 && (
          <span className={`text-xs font-medium ${volumeDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {volumeDiff > 0 ? '+' : ''}{formatWeightValue(volumeDiff, unit)}{unit} vol
          </span>
        )}
        {setsDiff !== 0 && (
          <span className={`text-xs font-medium ${setsDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {setsDiff > 0 ? '+' : ''}{setsDiff} sets
          </span>
        )}
      </div>
    </div>
  )
}

function BodyPartDistribution({ exercises }: { exercises: { bodyPart: string; totalVolume: number }[] }) {
  const distribution = useMemo(() => {
    const partVolume: Record<string, number> = {}
    let total = 0
    exercises.forEach(ex => {
      partVolume[ex.bodyPart] = (partVolume[ex.bodyPart] || 0) + ex.totalVolume
      total += ex.totalVolume
    })

    return Object.entries(partVolume)
      .map(([part, vol]) => ({
        part,
        name: BODY_PART_NAMES[part as BodyPart] || part,
        volume: vol,
        percentage: total > 0 ? Math.round((vol / total) * 100) : 0,
        color: BODY_PART_COLORS[part] || '#6B7280'
      }))
      .sort((a, b) => b.volume - a.volume)
  }, [exercises])

  if (distribution.length <= 1) return null

  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
        Volume by Body Part
      </h3>
      {/* Horizontal stacked bar */}
      <div className="h-3 rounded-full overflow-hidden flex mb-2">
        {distribution.map(d => (
          <div
            key={d.part}
            className="h-full transition-all"
            style={{ width: `${d.percentage}%`, backgroundColor: d.color }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {distribution.map(d => (
          <div key={d.part} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {d.name} {d.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function VolumeTrendChart({ data, currentDate, unit }: {
  data: { date: string; displayDate: string; volume: number; sets: number }[]
  currentDate: string
  unit: 'kg' | 'lbs'
}) {
  const chartWidth = 280
  const chartHeight = 100
  const paddingLeft = 5
  const paddingRight = 5
  const paddingTop = 15
  const paddingBottom = 20

  const plotWidth = chartWidth - paddingLeft - paddingRight
  const plotHeight = chartHeight - paddingTop - paddingBottom

  const volumes = data.map(d => d.volume)
  const minVol = Math.min(...volumes) * 0.85
  const maxVol = Math.max(...volumes) * 1.1
  const range = maxVol - minVol || 1

  const barWidth = Math.min(24, (plotWidth / data.length) * 0.7)
  const gap = (plotWidth - barWidth * data.length) / (data.length + 1)

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Daily Volume Trend
      </h3>

      <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
        {data.map((d, i) => {
          const barHeight = ((d.volume - minVol) / range) * plotHeight
          const x = paddingLeft + gap + i * (barWidth + gap)
          const y = paddingTop + plotHeight - barHeight
          const isCurrentDay = d.date === currentDate

          return (
            <g key={d.date}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={3}
                fill={isCurrentDay ? '#8B5CF6' : '#C4B5FD'}
                className={isCurrentDay ? '' : 'dark:fill-purple-800'}
                opacity={isCurrentDay ? 1 : 0.6}
              />
              {/* Value on current bar */}
              {isCurrentDay && (
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  className="text-[8px] font-bold fill-purple-600 dark:fill-purple-400"
                >
                  {formatWeightValue(d.volume, unit)}
                </text>
              )}
              {/* Date label */}
              {(i === 0 || i === data.length - 1 || isCurrentDay) && (
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 2}
                  textAnchor="middle"
                  className={`text-[8px] ${isCurrentDay ? 'fill-purple-600 dark:fill-purple-400 font-medium' : 'fill-gray-400'}`}
                >
                  {d.displayDate}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
