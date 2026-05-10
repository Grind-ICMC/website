import { Button } from "@/components/ui/button"
import { CreateFolderDialog } from "@/components/admin/create-folder-dialog"
import { DeleteFolderDialog } from "@/components/admin/delete-folder-dialog"
import { MeetingBreadcrumbs } from "@/components/admin/meeting-breadcrumbs"
import { Input } from "@/components/ui/input"
import {
  GitHubContentNotFoundError,
  InvalidMeetingPathError,
  getMeetingDirectory,
  getMeetingFolderHref,
  getMeetingHref,
  getParentPath,
} from "@/lib/github-meetings"
import {
  CalendarDays,
  FilePlus2,
  FileText,
  Folder,
  FolderOpen,
  Search,
  X,
} from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

export const dynamic = "force-dynamic"

type MeetingsExplorerPageProps = {
  params: Promise<{
    path?: string[]
  }>
  searchParams: Promise<{
    q?: string | string[]
  }>
}

function getRoutePath(path: string[] | undefined) {
  return path?.join("/") ?? ""
}

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function normalizeSearchTerm(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
}

function matchesSearchTerm(values: string[], searchTerm: string) {
  if (!searchTerm) {
    return true
  }

  return values.some((value) =>
    normalizeSearchTerm(value).includes(searchTerm),
  )
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

function EmptySearch({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="rounded-lg border border-cyan-400/15 bg-slate-900/70 p-8 text-center">
      <Search className="mx-auto size-10 text-cyan-300" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-white">
        Nenhum resultado encontrado
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Não encontramos pastas ou documentos para "{searchTerm}".
      </p>
    </div>
  )
}

export default async function MeetingsExplorerPage({
  params,
  searchParams,
}: MeetingsExplorerPageProps) {
  const { path } = await params
  const paramsSearch = await searchParams
  const currentPath = getRoutePath(path)
  const parentFolderHref = getMeetingFolderHref(getParentPath(currentPath))
  const rawSearchTerm = getSearchParam(paramsSearch.q)?.trim() ?? ""
  const searchTerm = normalizeSearchTerm(rawSearchTerm)

  if (currentPath.toLowerCase().endsWith(".md")) {
    redirect(getMeetingHref(currentPath))
  }

  try {
    const directory = await getMeetingDirectory(currentPath)
    const visibleDirectories = directory.directories.filter((item) =>
      matchesSearchTerm([item.name, item.path], searchTerm),
    )
    const visibleFiles = directory.files.filter((item) =>
      matchesSearchTerm([item.title, item.name, item.path], searchTerm),
    )
    const hasContent =
      directory.directories.length > 0 || directory.files.length > 0
    const hasVisibleContent =
      visibleDirectories.length > 0 || visibleFiles.length > 0

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
            {currentPath ? (
              <DeleteFolderDialog
                folderPath={currentPath}
                parentFolderHref={parentFolderHref}
              />
            ) : null}
          </div>
        </div>

        {hasContent ? (
          <form
            role="search"
            className="mb-5 flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <Input
                type="search"
                name="q"
                defaultValue={rawSearchTerm}
                placeholder="Pesquisar atas e pastas"
                className="h-11 border-cyan-400/15 bg-slate-900/75 pr-3 pl-10 text-slate-100 placeholder:text-slate-500 focus-visible:border-cyan-300/60 focus-visible:ring-cyan-300/20"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                className="h-11 bg-cyan-300 text-slate-950 hover:bg-cyan-200"
              >
                <Search className="size-4" aria-hidden="true" />
                Pesquisar
              </Button>
              {rawSearchTerm ? (
                <Button
                  asChild
                  type="button"
                  variant="outline"
                  className="h-11 border-cyan-400/20 bg-slate-950/40 text-slate-200 hover:bg-slate-900 hover:text-white"
                >
                  <Link href={getMeetingFolderHref(currentPath)}>
                    <X className="size-4" aria-hidden="true" />
                    Limpar
                  </Link>
                </Button>
              ) : null}
            </div>
          </form>
        ) : null}

        {hasVisibleContent ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleDirectories.map((item) => (
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
                  </div>
                </div>
              </Link>
            ))}

            {visibleFiles.map((item) => (
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
                      {item.title}
                    </h2>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : hasContent ? (
          <EmptySearch searchTerm={rawSearchTerm} />
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
