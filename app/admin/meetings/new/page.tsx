import { RepositoryNewDocument } from "@/components/admin/repository-new-document"

export const dynamic = "force-dynamic"

type NewMeetingPageProps = {
  searchParams: Promise<{
    path?: string | string[]
  }>
}

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function NewMeetingPage({
  searchParams,
}: NewMeetingPageProps) {
  const params = await searchParams

  return (
    <RepositoryNewDocument
      repository="meetings"
      currentPath={getSearchParam(params.path)?.trim() ?? ""}
    />
  )
}
