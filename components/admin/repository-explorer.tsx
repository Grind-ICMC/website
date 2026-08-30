import {
  BookOpenText,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  FilePlus2,
  FileText,
  Folder,
  FolderOpen,
  GraduationCap,
  LayoutGrid,
  Search,
  ListTree,
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
  getRepositoryFiles,
  type RepositoryDocumentSummary,
} from "@/lib/github-meetings"
import { cn } from "@/lib/utils"

type ExplorerViewMode = "cards" | "tree"

type RepositoryExplorerProps = {
  repository: AdminRepositorySlug
  path?: string[]
  rawSearchTerm: string
  rawViewMode: string
}

const REPOSITORY_ICONS: Record<AdminRepositorySlug, LucideIcon> = {
  meetings: CalendarDays,
  docs: BookOpenText,
  studies: GraduationCap,
  "psel-empresas": BriefcaseBusiness,
}

type RepositoryTreeNode = {
  name: string
  path: string
  folders: RepositoryTreeNode[]
  files: RepositoryDocumentSummary[]
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

function getViewMode(rawViewMode: string): ExplorerViewMode {
  return rawViewMode === "tree" ? "tree" : "cards"
}

function withExplorerParams(
  href: string,
  viewMode: ExplorerViewMode,
  rawSearchTerm: string,
) {
  const params = new URLSearchParams()

  if (viewMode === "tree") {
    params.set("view", "tree")
  }

  if (rawSearchTerm) {
    params.set("q", rawSearchTerm)
  }

  const query = params.toString()
  return query ? `${href}?${query}` : href
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

function createTreeNode(name: string, path: string): RepositoryTreeNode {
  return {
    name,
    path,
    folders: [],
    files: [],
  }
}

function buildRepositoryTree(files: RepositoryDocumentSummary[]) {
  const root = createTreeNode("Root", "")
  const foldersByPath = new Map<string, RepositoryTreeNode>([["", root]])

  for (const file of files) {
    const segments = file.path.split("/")
    let parent = root
    let currentPath = ""

    for (const segment of segments.slice(0, -1)) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment
      let folder = foldersByPath.get(currentPath)

      if (!folder) {
        folder = createTreeNode(segment, currentPath)
        foldersByPath.set(currentPath, folder)
        parent.folders.push(folder)
      }

      parent = folder
    }

    parent.files.push(file)
  }

  function sortNode(node: RepositoryTreeNode) {
    node.folders.sort((left, right) => left.name.localeCompare(right.name))
    node.files.sort((left, right) => left.title.localeCompare(right.title))
    node.folders.forEach(sortNode)
  }

  sortNode(root)
  return root
}

function RepositoryTree({
  node,
  repository,
  currentPath,
  rawSearchTerm,
  depth = 0,
}: {
  node: RepositoryTreeNode
  repository: AdminRepositorySlug
  currentPath: string
  rawSearchTerm: string
  depth?: number
}) {
  return (
    <div className={depth ? "mt-1" : undefined}>
      {node.folders.map((folder) => {
        const isActive = folder.path === currentPath

        return (
          <div key={folder.path} className="mt-1">
            <Link
              href={withExplorerParams(
                getRepositoryFolderHref(repository, folder.path),
                "tree",
                rawSearchTerm,
              )}
              title={folder.path}
              className={cn(
                "flex h-8 min-w-0 items-center gap-2 rounded-md px-2 text-sm transition",
                isActive
                  ? "bg-cyan-300/12 text-cyan-100"
                  : "text-slate-300 hover:bg-white/[0.04] hover:text-white",
              )}
              style={{ paddingLeft: `${8 + depth * 16}px` }}
            >
              <ChevronRight className="size-3.5 shrink-0 text-slate-500" />
              <Folder className="size-4 shrink-0 text-cyan-300" />
              <span className="truncate">{folder.name}</span>
            </Link>
            <RepositoryTree
              node={folder}
              repository={repository}
              currentPath={currentPath}
              rawSearchTerm={rawSearchTerm}
              depth={depth + 1}
            />
          </div>
        )
      })}

      {node.files.map((file) => (
        <Link
          key={file.path}
          href={getRepositoryDocumentHref(repository, file.path)}
          title={file.path}
          className="mt-1 flex h-8 min-w-0 items-center gap-2 rounded-md px-2 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
          style={{ paddingLeft: `${24 + depth * 16}px` }}
        >
          <FileText className="size-4 shrink-0 text-slate-500" />
          <span className="truncate">{file.title}</span>
        </Link>
      ))}
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
  rawViewMode,
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
  const viewMode = getViewMode(rawViewMode)

  if (currentPath.toLowerCase().endsWith(".md")) {
    redirect(getRepositoryDocumentHref(repository, currentPath))
  }

  try {
    const [directory, repositoryFiles] = await Promise.all([
      getRepositoryDirectory(repository, currentPath),
      viewMode === "tree"
        ? getRepositoryFiles(repository)
        : Promise.resolve([] as RepositoryDocumentSummary[]),
    ])
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
    const visibleTreeFiles = repositoryFiles.filter((item) =>
      matchesSearchTerm([item.title, item.name, item.path], searchTerm),
    )
    const repositoryTree = buildRepositoryTree(visibleTreeFiles)

    const contentGrid = hasVisibleContent ? (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleDirectories.map((item) => (
          <Link
            key={item.path}
            href={withExplorerParams(
              getRepositoryFolderHref(repository, item.path),
              viewMode,
              rawSearchTerm,
            )}
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
    )

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
            <div className="flex h-10 rounded-md border border-cyan-400/15 bg-slate-950/50 p-1">
              <Button
                asChild
                size="sm"
                variant="ghost"
                className={cn(
                  "h-8 px-3 text-slate-300 hover:bg-cyan-300/10 hover:text-white",
                  viewMode === "cards" && "bg-cyan-300 text-slate-950 hover:bg-cyan-200 hover:text-slate-950",
                )}
              >
                <Link
                  href={withExplorerParams(
                    getRepositoryFolderHref(repository, currentPath),
                    "cards",
                    rawSearchTerm,
                  )}
                >
                  <LayoutGrid className="size-4" aria-hidden="true" />
                  Cards
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className={cn(
                  "h-8 px-3 text-slate-300 hover:bg-cyan-300/10 hover:text-white",
                  viewMode === "tree" && "bg-cyan-300 text-slate-950 hover:bg-cyan-200 hover:text-slate-950",
                )}
              >
                <Link
                  href={withExplorerParams(
                    getRepositoryFolderHref(repository, currentPath),
                    "tree",
                    rawSearchTerm,
                  )}
                >
                  <ListTree className="size-4" aria-hidden="true" />
                  Árvore
                </Link>
              </Button>
            </div>
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
            <input type="hidden" name="view" value={viewMode} />
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
                  <Link
                    href={withExplorerParams(
                      getRepositoryFolderHref(repository, currentPath),
                      viewMode,
                      "",
                    )}
                  >
                    <X className="size-4" aria-hidden="true" />
                    Limpar
                  </Link>
                </Button>
              ) : null}
            </div>
          </form>
        ) : null}

        {viewMode === "tree" ? (
          <div className="grid gap-5 xl:grid-cols-[19rem_minmax(0,1fr)]">
            <aside className="max-h-[calc(100vh-14rem)] overflow-auto rounded-lg border border-cyan-400/15 bg-slate-950/70 p-3">
              <Link
                href={withExplorerParams(
                  getRepositoryFolderHref(repository),
                  "tree",
                  rawSearchTerm,
                )}
                className={cn(
                  "mb-2 flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium transition",
                  currentPath
                    ? "text-slate-300 hover:bg-white/[0.04] hover:text-white"
                    : "bg-cyan-300/12 text-cyan-100",
                )}
              >
                <FolderOpen className="size-4 text-cyan-300" aria-hidden="true" />
                Root
              </Link>
              {visibleTreeFiles.length ? (
                <RepositoryTree
                  node={repositoryTree}
                  repository={repository}
                  currentPath={currentPath}
                  rawSearchTerm={rawSearchTerm}
                />
              ) : (
                <p className="px-2 py-3 text-sm text-slate-500">
                  Nenhum arquivo encontrado.
                </p>
              )}
            </aside>
            <div className="min-w-0">{contentGrid}</div>
          </div>
        ) : (
          contentGrid
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
