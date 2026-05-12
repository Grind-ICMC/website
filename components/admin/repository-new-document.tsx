import { ArrowLeft, FilePlus2 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { auth } from "@/auth"
import { MeetingCreateForm } from "@/components/admin/meeting-create-form"
import {
  getAdminRepositoryConfig,
  getRepositoryFullName,
  type AdminRepositorySlug,
} from "@/lib/admin-repositories"
import {
  InvalidMeetingPathError,
  assertValidDirectoryPath,
  getRepositoryFolderHref,
} from "@/lib/github-meetings"

type RepositoryNewDocumentProps = {
  repository: AdminRepositorySlug
  currentPath: string
}

export async function RepositoryNewDocument({
  repository,
  currentPath,
}: RepositoryNewDocumentProps) {
  const session = await auth()
  const repositoryConfig = getAdminRepositoryConfig(repository)
  const currentFolderHref = getRepositoryFolderHref(repository, currentPath)
  const defaultAuthor = session?.user?.name ?? session?.user?.email ?? ""

  try {
    assertValidDirectoryPath(currentPath)
  } catch (error) {
    if (error instanceof InvalidMeetingPathError) {
      notFound()
    }

    throw error
  }

  return (
    <section>
      <Link
        href={currentFolderHref}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-100"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para pasta
      </Link>

      <header className="mb-8 border-b border-cyan-400/15 pb-6">
        <p className="flex items-center gap-2 text-sm font-medium text-cyan-300">
          <FilePlus2 className="size-4" aria-hidden="true" />
          {repositoryConfig.createButtonLabel}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          {repositoryConfig.createHeading}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-400">
          O arquivo sera salvo no repositorio{" "}
          {getRepositoryFullName(repositoryConfig)} com frontmatter YAML e corpo
          em Markdown.
        </p>
        <p className="mt-3 rounded-md bg-slate-950/70 px-3 py-2 font-mono text-xs text-slate-400">
          {currentPath || "Root"}
        </p>
      </header>

      <MeetingCreateForm
        repository={repository}
        defaultAuthor={defaultAuthor}
        currentPath={currentPath}
        currentFolderHref={currentFolderHref}
      />
    </section>
  )
}
