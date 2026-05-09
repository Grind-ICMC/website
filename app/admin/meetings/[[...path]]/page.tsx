import { Button } from "@/components/ui/button"
import { CreateFolderDialog } from "@/components/admin/create-folder-dialog"
import { MeetingBreadcrumbs } from "@/components/admin/meeting-breadcrumbs"
import {
  GitHubContentNotFoundError,
  InvalidMeetingPathError,
  getMeetingDirectory,
  getMeetingFolderHref,
  getMeetingHref,
} from "@/lib/github-meetings"
import {
  CalendarDays,
  FilePlus2,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

export const dynamic = "force-dynamic"

type MeetingsExplorerPageProps = {
  params: Promise<{
    path?: string[]
  }>
}

function getRoutePath(path: string[] | undefined) {
  return path?.join("/") ?? ""
}

function getNewDocumentHref(currentPath: string) {
  if (!currentPath) {
    return "/admin/meetings/new"
  }

  return `/admin/meetings/new?${new URLSearchParams({
    path: currentPath,
  }).toString()}`
}

function MeetingsError() {
  return (
    <div className="rounded-lg border border-red-400/25 bg-red-950/30 p-6 text-red-100">
      <h2 className="text-lg font-semibold text-white">
        Não foi possível carregar esta pasta.
      </h2>
      <p className="mt-2 text-sm text-red-100/80">
        Verifique se o token GitHub do servidor está configurado e tem acesso ao
        repositório Grind-ICMC/meetings.
      </p>
    </div>
  )
}

function EmptyDirectory() {
  return (
    <div className="rounded-lg border border-cyan-400/15 bg-slate-900/70 p-8 text-center">
      <FolderOpen className="mx-auto size-10 text-cyan-300" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-white">Pasta vazia</h2>
      <p className="mt-2 text-sm text-slate-400">
        Crie uma pasta ou documento para começar a organizar as atas aqui.
      </p>
    </div>
  )
}

export default async function MeetingsExplorerPage({
  params,
}: MeetingsExplorerPageProps) {
  const { path } = await params
  const currentPath = getRoutePath(path)

  if (currentPath.toLowerCase().endsWith(".md")) {
    redirect(getMeetingHref(currentPath))
  }

  try {
    const directory = await getMeetingDirectory(currentPath)
    const hasContent =
      directory.directories.length > 0 || directory.files.length > 0

    return (
      <section>
        <MeetingBreadcrumbs path={currentPath} />

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-cyan-300">
              <CalendarDays className="size-4" aria-hidden="true" />
              Atas da Reunião
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Documentação interna
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Navegue pela mesma estrutura de pastas do repositório
              Grind-ICMC/meetings.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"
            >
              <Link href={getNewDocumentHref(currentPath)}>
                <FilePlus2 className="size-4" aria-hidden="true" />
                Novo Documento
              </Link>
            </Button>
            <CreateFolderDialog currentPath={currentPath} />
          </div>
        </div>

        {hasContent ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {directory.directories.map((item) => (
              <Link
                key={item.path}
                href={getMeetingFolderHref(item.path)}
                className="group rounded-lg border border-cyan-400/15 bg-slate-900/75 p-5 transition hover:border-cyan-300/50 hover:bg-slate-900"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-cyan-300/10 text-cyan-300">
                    <Folder className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-white group-hover:text-cyan-200">
                      {item.name}
                    </h2>
                    <p className="mt-2 truncate text-sm text-slate-400">
                      Pasta
                    </p>
                  </div>
                </div>
                <p className="mt-4 truncate rounded-md bg-slate-950/70 px-3 py-2 font-mono text-xs text-slate-400">
                  {item.path}
                </p>
              </Link>
            ))}

            {directory.files.map((item) => (
              <Link
                key={item.path}
                href={getMeetingHref(item.path)}
                className="group rounded-lg border border-cyan-400/15 bg-slate-900/75 p-5 transition hover:border-cyan-300/50 hover:bg-slate-900"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-cyan-300/10 text-cyan-300">
                    <FileText className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-white group-hover:text-cyan-200">
                      {item.name}
                    </h2>
                    <p className="mt-2 truncate text-sm text-slate-400">
                      Documento Markdown
                    </p>
                  </div>
                </div>
                <p className="mt-4 truncate rounded-md bg-slate-950/70 px-3 py-2 font-mono text-xs text-slate-400">
                  {item.path}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyDirectory />
        )}
      </section>
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
        <MeetingBreadcrumbs path={currentPath} />
        <MeetingsError />
      </section>
    )
  }
}
