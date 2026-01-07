'use client'

import { useState } from 'react'
import { markGesturesOnboardingComplete, skipAllTips } from '@/lib/storage/onboarding'

interface GesturesOnboardingProps {
  onComplete: () => void
}

interface GestureStep {
  icon: string
  title: string
  description: string
  gesture: string
}

const GESTURE_STEPS: GestureStep[] = [
  {
    icon: '👆👆',
    title: 'Expand Workout Log',
    description: 'Double-tap on the workout log area or timer to go full-screen for easier input.',
    gesture: 'Double-tap'
  },
  {
    icon: '📲',
    title: 'Minimize Full-Screen',
    description: 'When in full-screen mode, double-tap on any empty space to minimize back.',
    gesture: 'Double-tap empty space'
  },
  {
    icon: '👆⏱️',
    title: 'Clear Active Status',
    description: 'Long-press on a collapsed exercise card to remove its active status.',
    gesture: 'Long-press (0.6s)'
  }
]

export default function GesturesOnboarding({ onComplete }: GesturesOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < GESTURE_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      markGesturesOnboardingComplete()
      onComplete()
    }
  }

  const handleSkip = () => {
    skipAllTips() // Disables all future tips
    onComplete()
  }

  const step = GESTURE_STEPS[currentStep]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-6">
          {GESTURE_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-blue-500'
                  : index < currentStep
                  ? 'bg-blue-300'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Animated Icon */}
          <div className="text-6xl mb-6 animate-bounce">
            {step.icon}
          </div>

          {/* Gesture badge */}
          <div className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
            {step.gesture}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl transition-all shadow-md"
          >
            {currentStep < GESTURE_STEPS.length - 1 ? 'Next' : 'Got it!'}
          </button>

          {currentStep < GESTURE_STEPS.length - 1 && (
            <button
              onClick={handleSkip}
              className="w-full text-gray-500 dark:text-gray-400 text-sm font-medium py-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Skip all tips
            </button>
          )}

          {/* Settings hint */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 pt-1">
            {currentStep < GESTURE_STEPS.length - 1
              ? 'Skipping will disable all tips'
              : 'View tips anytime in Settings'}
          </p>
        </div>
      </div>
    </div>
  )
}
