import { notFound } from "next/navigation"

import { RepositoryExplorer } from "@/components/admin/repository-explorer"
import { getAdminRepositoryConfig } from "@/lib/admin-repositories"

export const dynamic = "force-dynamic"

type AdminRepositoryExplorerPageProps = {
  params: Promise<{
    repository: string
    path?: string[]
  }>
  searchParams: Promise<{
    q?: string | string[]
  }>
}

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function AdminRepositoryExplorerPage({
  params,
  searchParams,
}: AdminRepositoryExplorerPageProps) {
  const [{ repository, path }, paramsSearch] = await Promise.all([
    params,
    searchParams,
  ])
  const repositoryConfig = getAdminRepositoryConfig(repository)

  if (!repositoryConfig) {
    notFound()
  }

  return (
    <RepositoryExplorer
      repository={repositoryConfig.slug}
      path={path}
      rawSearchTerm={getSearchParam(paramsSearch.q)?.trim() ?? ""}
    />
  )
}
