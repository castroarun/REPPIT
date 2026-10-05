'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProgramClient from './ProgramClient'

function ProgramRoute() {
  const id = useSearchParams().get('id') ?? ''
  return <ProgramClient id={id} />
}

// useSearchParams needs a Suspense boundary so this page can be prerendered
// as a single static shell; the real id is read in the browser at runtime.
export default function ProgramPage() {
  return (
    <Suspense fallback={null}>
      <ProgramRoute />
    </Suspense>
  )
}
