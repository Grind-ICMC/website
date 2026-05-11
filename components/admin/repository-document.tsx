import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { MeetingDocument } from "@/components/admin/meeting-document"
import {
  getAdminRepositoryConfig,
  type AdminRepositorySlug,
} from "@/lib/admin-repositories"
import {
  GitHubContentNotFoundError,
  InvalidMeetingPathError,
  getParentPath,
  getRepositoryFolderHref,
  getRepositoryMarkdown,
} from "@/lib/github-meetings"
import { getMeetingFrontmatterForForm } from "@/lib/meeting-cms"

type RepositoryDocumentProps = {
  repository: AdminRepositorySlug
  path?: string[]
}

function getRoutePath(path: string[] | undefined) {
  return path?.join("/") ?? ""
}

export async function RepositoryDocument({
  repository,
  path,
}: RepositoryDocumentProps) {
  const repositoryConfig = getAdminRepositoryConfig(repository)
  const documentPath = getRoutePath(path)
  const parentFolderHref = getRepositoryFolderHref(
    repository,
    getParentPath(documentPath),
  )

  try {
    const document = await getRepositoryMarkdown(repository, documentPath)
    const frontmatter = getMeetingFrontmatterForForm(
      document.frontmatter,
      document.title,
    )

    return (
      <article>
        <Link
          href={parentFolderHref}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-100"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para pasta
        </Link>

        <MeetingDocument
          repository={repository}
          parentFolderHref={parentFolderHref}
          initialMeeting={{
            path: document.path,
            sha: document.sha,
            title: document.title,
            frontmatter,
            content: document.content,
          }}
        />
      </article>
    )
  } catch (error) {
    if (
      error instanceof InvalidMeetingPathError ||
      error instanceof GitHubContentNotFoundError
    ) {
      notFound()
    }

    return (
      <section>
        <Link
          href={parentFolderHref}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-100"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para pasta
        </Link>
        <div className="rounded-lg border border-red-400/25 bg-red-950/30 p-6 text-red-100">
          <h1 className="text-lg font-semibold text-white">
            Não foi possível carregar este {repositoryConfig.documentLabel}.
          </h1>
          <p className="mt-2 text-sm text-red-100/80">
            Tente novamente em instantes ou verifique o acesso do servidor ao
            repositório.
          </p>
        </div>
      </section>
    )
  }
}
