import EditClient from './EditClient'

// Required for static export with dynamic routes
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return []
}

interface EditProfilePageProps {
  params: Promise<{ id: string }>
}

export default function EditProfilePage({ params }: EditProfilePageProps) {
  return <EditClient params={params} />
}
