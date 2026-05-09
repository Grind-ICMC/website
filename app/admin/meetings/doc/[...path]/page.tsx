import { MeetingDocument } from "@/components/admin/meeting-document"
import {
  GitHubContentNotFoundError,
  InvalidMeetingPathError,
  getMeetingFolderHref,
  getMeetingMarkdown,
  getParentPath,
} from "@/lib/github-meetings"
import { getMeetingFrontmatterForForm } from "@/lib/meeting-cms"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type MeetingPageProps = {
  params: Promise<{
    path?: string[]
  }>
}

function getRoutePath(path: string[] | undefined) {
  return path?.join("/") ?? ""
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { path } = await params
  const meetingPath = getRoutePath(path)
  const parentFolderHref = getMeetingFolderHref(getParentPath(meetingPath))

  try {
    const meeting = await getMeetingMarkdown(meetingPath)
    const frontmatter = getMeetingFrontmatterForForm(
      meeting.frontmatter,
      meeting.title,
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
          parentFolderHref={parentFolderHref}
          initialMeeting={{
            path: meeting.path,
            sha: meeting.sha,
            title: meeting.title,
            frontmatter,
            content: meeting.content,
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
            Não foi possível carregar esta ata.
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
