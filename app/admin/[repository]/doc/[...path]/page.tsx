import { notFound } from "next/navigation"

import { RepositoryDocument } from "@/components/admin/repository-document"
import { getAdminRepositoryConfig } from "@/lib/admin-repositories"

export const dynamic = "force-dynamic"

type AdminRepositoryDocumentPageProps = {
  params: Promise<{
    repository: string
    path?: string[]
  }>
}

export default async function AdminRepositoryDocumentPage({
  params,
}: AdminRepositoryDocumentPageProps) {
  const { repository, path } = await params
  const repositoryConfig = getAdminRepositoryConfig(repository)

  if (!repositoryConfig) {
    notFound()
  }

  return <RepositoryDocument repository={repositoryConfig.slug} path={path} />
}
