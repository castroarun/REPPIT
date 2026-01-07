import ProgressClient from './ProgressClient'

// Required for static export with dynamic routes
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return []
}

interface ProgressPageProps {
  params: Promise<{ id: string }>
}

export default function ProgressPage({ params }: ProgressPageProps) {
  return <ProgressClient params={params} />
}
