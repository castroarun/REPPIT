'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProfileClient from './ProfileClient'

function ProfileDetailRoute() {
  const id = useSearchParams().get('id') ?? ''
  return <ProfileClient id={id} />
}

// useSearchParams needs a Suspense boundary so this page can be prerendered
// as a single static shell; the real id is read in the browser at runtime.
export default function ProfileDetailPage() {
  return (
    <Suspense fallback={null}>
      <ProfileDetailRoute />
    </Suspense>
  )
}
