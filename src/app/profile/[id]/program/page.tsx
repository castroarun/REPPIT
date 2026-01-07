import ProgramClient from './ProgramClient'

// Required for static export with dynamic routes
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return []
}

interface ProgramPageProps {
  params: Promise<{ id: string }>
}

export default function ProgramPage({ params }: ProgramPageProps) {
  return <ProgramClient params={params} />
}
