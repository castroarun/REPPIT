'use client'

import { useUnit } from '@/contexts'

export default function UnitToggle() {
  const { unit, toggleUnit } = useUnit()

  return (
    <button
      onClick={toggleUnit}
      className="px-2 py-1 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors"
      aria-label={`Switch to ${unit === 'kg' ? 'lbs' : 'kg'}`}
      title={`Switch to ${unit === 'kg' ? 'lbs' : 'kg'}`}
    >
      {unit.toUpperCase()}
    </button>
  )
}
