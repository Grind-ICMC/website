import { RepositoryDocument } from "@/components/admin/repository-document"

export const dynamic = "force-dynamic"

type MeetingPageProps = {
  params: Promise<{
    path?: string[]
  }>
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { path } = await params

  return <RepositoryDocument repository="meetings" path={path} />
}
