'use client'

import { useUnit } from '@/contexts'

export default function UnitToggle() {
  const { unit, toggleUnit } = useUnit()

  return (
    <button
      onClick={toggleUnit}
      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors border border-gray-300 dark:border-gray-500"
      aria-label={`Switch to ${unit === 'kg' ? 'lbs' : 'kg'}`}
      title={`Switch to ${unit === 'kg' ? 'lbs' : 'kg'}`}
    >
      {unit.toUpperCase()}
    </button>
  )
}
