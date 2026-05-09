import {
  GitHubContentNotFoundError,
  InvalidMeetingPathError,
  getMeetingMarkdown,
} from "@/lib/github-meetings"
import { ArrowLeft, FileText, FolderTree } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"

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

  try {
    const meeting = await getMeetingMarkdown(meetingPath)

    return (
      <article>
        <Link
          href="/admin/meetings"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-100"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para atas
        </Link>

        <header className="mb-8 border-b border-cyan-400/15 pb-6">
          <p className="flex items-center gap-2 text-sm font-medium text-cyan-300">
            <FileText className="size-4" aria-hidden="true" />
            Ata da reunião
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            {meeting.title}
          </h1>
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <FolderTree className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{meeting.path}</span>
          </p>
        </header>

        <div className="rounded-lg border border-cyan-400/15 bg-slate-900/70 px-5 py-6 sm:px-8">
          <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-cyan-300 prose-a:no-underline hover:prose-a:text-cyan-100 prose-code:text-cyan-100 prose-pre:border prose-pre:border-cyan-400/15 prose-pre:bg-slate-950 prose-strong:text-white">
            <ReactMarkdown
              components={{
                a: ({ node: _node, ...props }) => (
                  <a {...props} target="_blank" rel="noreferrer" />
                ),
              }}
            >
              {meeting.content}
            </ReactMarkdown>
          </div>
        </div>
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
          href="/admin/meetings"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-100"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para atas
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
