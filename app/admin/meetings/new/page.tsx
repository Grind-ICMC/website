import { auth } from "@/auth"
import { MeetingCreateForm } from "@/components/admin/meeting-create-form"
import {
  InvalidMeetingPathError,
  assertValidDirectoryPath,
  getMeetingFolderHref,
} from "@/lib/github-meetings"
import { ArrowLeft, FilePlus2 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

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
  const session = await auth()
  const params = await searchParams
  const currentPath = getSearchParam(params.path)?.trim() ?? ""
  const currentFolderHref = getMeetingFolderHref(currentPath)
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
          Novo documento
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          Criar ata
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-400">
          O arquivo sera salvo no repositorio Grind-ICMC/meetings com
          frontmatter YAML e corpo em Markdown.
        </p>
        <p className="mt-3 rounded-md bg-slate-950/70 px-3 py-2 font-mono text-xs text-slate-400">
          {currentPath || "Root"}
        </p>
      </header>

      <MeetingCreateForm
        defaultAuthor={defaultAuthor}
        currentPath={currentPath}
        currentFolderHref={currentFolderHref}
      />
    </section>
  )
}
