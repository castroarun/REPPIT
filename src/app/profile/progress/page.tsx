'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProgressClient from './ProgressClient'

function ProgressRoute() {
  const id = useSearchParams().get('id') ?? ''
  return <ProgressClient id={id} />
}

// useSearchParams needs a Suspense boundary so this page can be prerendered
// as a single static shell; the real id is read in the browser at runtime.
export default function ProgressPage() {
  return (
    <Suspense fallback={null}>
      <ProgressRoute />
    </Suspense>
  )
}
