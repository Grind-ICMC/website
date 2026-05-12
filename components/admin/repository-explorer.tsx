import {
  BookOpenText,
  CalendarDays,
  FilePlus2,
  FileText,
  Folder,
  FolderOpen,
  GraduationCap,
  Search,
  X,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { CreateFolderDialog } from "@/components/admin/create-folder-dialog"
import { DeleteFolderDialog } from "@/components/admin/delete-folder-dialog"
import { MeetingBreadcrumbs } from "@/components/admin/meeting-breadcrumbs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  getAdminRepositoryConfig,
  getRepositoryFullName,
  type AdminRepositoryConfig,
  type AdminRepositorySlug,
} from "@/lib/admin-repositories"
import {
  GitHubContentNotFoundError,
  InvalidMeetingPathError,
  getParentPath,
  getRepositoryDirectory,
  getRepositoryDocumentHref,
  getRepositoryFolderHref,
} from "@/lib/github-meetings"

type RepositoryExplorerProps = {
  repository: AdminRepositorySlug
  path?: string[]
  rawSearchTerm: string
}

const REPOSITORY_ICONS: Record<AdminRepositorySlug, LucideIcon> = {
  meetings: CalendarDays,
  docs: BookOpenText,
  studies: GraduationCap,
}

function getRoutePath(path: string[] | undefined) {
  return path?.join("/") ?? ""
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

function getNewDocumentHref(
  repository: AdminRepositorySlug,
  currentPath: string,
) {
  if (!currentPath) {
    return `/admin/${repository}/new`
  }

  return `/admin/${repository}/new?${new URLSearchParams({
    path: currentPath,
  }).toString()}`
}

function RepositoryError({
  repositoryFullName,
}: {
  repositoryFullName: string
}) {
  return (
    <div className="rounded-lg border border-red-400/25 bg-red-950/30 p-6 text-red-100">
      <h2 className="text-lg font-semibold text-white">
        Não foi possível carregar esta pasta.
      </h2>
      <p className="mt-2 text-sm text-red-100/80">
        Verifique se o token GitHub do servidor está configurado e tem acesso ao
        repositório {repositoryFullName}.
      </p>
    </div>
  )
}

function EmptyDirectory({
  repositoryConfig,
}: {
  repositoryConfig: AdminRepositoryConfig
}) {
  return (
    <div className="rounded-lg border border-cyan-400/15 bg-slate-900/70 p-8 text-center">
      <FolderOpen className="mx-auto size-10 text-cyan-300" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-white">Pasta vazia</h2>
      <p className="mt-2 text-sm text-slate-400">
        {repositoryConfig.emptyDirectoryDescription}
      </p>
    </div>
  )
}

function EmptySearch({
  repositoryConfig,
  searchTerm,
}: {
  repositoryConfig: AdminRepositoryConfig
  searchTerm: string
}) {
  return (
    <div className="rounded-lg border border-cyan-400/15 bg-slate-900/70 p-8 text-center">
      <Search className="mx-auto size-10 text-cyan-300" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-white">
        Nenhum resultado encontrado
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Não encontramos pastas ou {repositoryConfig.documentLabelPlural} para{" "}
        &quot;{searchTerm}&quot;.
      </p>
    </div>
  )
}

export async function RepositoryExplorer({
  repository,
  path,
  rawSearchTerm,
}: RepositoryExplorerProps) {
  const repositoryConfig = getAdminRepositoryConfig(repository)
  const repositoryFullName = getRepositoryFullName(repositoryConfig)
  const RepositoryIcon = REPOSITORY_ICONS[repository]
  const currentPath = getRoutePath(path)
  const parentFolderHref = getRepositoryFolderHref(
    repository,
    getParentPath(currentPath),
  )
  const searchTerm = normalizeSearchTerm(rawSearchTerm)

  if (currentPath.toLowerCase().endsWith(".md")) {
    redirect(getRepositoryDocumentHref(repository, currentPath))
  }

  try {
    const directory = await getRepositoryDirectory(repository, currentPath)
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
        <MeetingBreadcrumbs repository={repository} path={currentPath} />

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-cyan-300">
              <RepositoryIcon className="size-4" aria-hidden="true" />
              {repositoryConfig.explorerEyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              {repositoryConfig.explorerTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Navegue pela mesma estrutura de pastas do repositório{" "}
              {repositoryFullName}.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"
            >
              <Link href={getNewDocumentHref(repository, currentPath)}>
                <FilePlus2 className="size-4" aria-hidden="true" />
                {repositoryConfig.createButtonLabel}
              </Link>
            </Button>
            <CreateFolderDialog
              repository={repository}
              currentPath={currentPath}
            />
            {currentPath ? (
              <DeleteFolderDialog
                repository={repository}
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
                placeholder={repositoryConfig.searchPlaceholder}
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
                  <Link href={getRepositoryFolderHref(repository, currentPath)}>
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
                href={getRepositoryFolderHref(repository, item.path)}
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
                href={getRepositoryDocumentHref(repository, item.path)}
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
          <EmptySearch
            repositoryConfig={repositoryConfig}
            searchTerm={rawSearchTerm}
          />
        ) : (
          <EmptyDirectory repositoryConfig={repositoryConfig} />
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
        <MeetingBreadcrumbs repository={repository} path={currentPath} />
        <RepositoryError repositoryFullName={repositoryFullName} />
      </section>
    )
  }
}
