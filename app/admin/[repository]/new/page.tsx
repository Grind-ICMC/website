import { notFound } from "next/navigation"

import { RepositoryNewDocument } from "@/components/admin/repository-new-document"
import { getAdminRepositoryConfig } from "@/lib/admin-repositories"

export const dynamic = "force-dynamic"

type AdminRepositoryNewPageProps = {
  params: Promise<{
    repository: string
  }>
  searchParams: Promise<{
    path?: string | string[]
  }>
}

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function AdminRepositoryNewPage({
  params,
  searchParams,
}: AdminRepositoryNewPageProps) {
  const [{ repository }, paramsSearch] = await Promise.all([
    params,
    searchParams,
  ])
  const repositoryConfig = getAdminRepositoryConfig(repository)

  if (!repositoryConfig) {
    notFound()
  }

  return (
    <RepositoryNewDocument
      repository={repositoryConfig.slug}
      currentPath={getSearchParam(paramsSearch.path)?.trim() ?? ""}
    />
  )
}
