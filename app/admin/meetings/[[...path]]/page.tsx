import { RepositoryExplorer } from "@/components/admin/repository-explorer"

export const dynamic = "force-dynamic"

type MeetingsExplorerPageProps = {
  params: Promise<{
    path?: string[]
  }>
  searchParams: Promise<{
    q?: string | string[]
  }>
}

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function MeetingsExplorerPage({
  params,
  searchParams,
}: MeetingsExplorerPageProps) {
  const [{ path }, paramsSearch] = await Promise.all([params, searchParams])

  return (
    <RepositoryExplorer
      repository="meetings"
      path={path}
      rawSearchTerm={getSearchParam(paramsSearch.q)?.trim() ?? ""}
    />
  )
}
