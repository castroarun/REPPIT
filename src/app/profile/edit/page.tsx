'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import EditClient from './EditClient'

function EditRoute() {
  const id = useSearchParams().get('id') ?? ''
  return <EditClient id={id} />
}

// useSearchParams needs a Suspense boundary so this page can be prerendered
// as a single static shell; the real id is read in the browser at runtime.
export default function EditProfilePage() {
  return (
    <Suspense fallback={null}>
      <EditRoute />
    </Suspense>
  )
}
