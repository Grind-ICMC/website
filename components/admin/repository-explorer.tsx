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
  Search,
  X,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { CreateFolderDialog } from "@/components/admin/create-folder-dialog"
import { DeleteFolderDialog } from "@/components/admin/delete-folder-dialog"
import { MeetingBreadcrumbs } from "@/components/admin/meeting-breadcrumbs"
import { RepositoryTreeLayout } from "@/components/admin/repository-tree-layout"
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

type RepositoryExplorerProps = {
  repository: AdminRepositorySlug
  path?: string[]
  rawSearchTerm: string
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

function withSearchParam(href: string, rawSearchTerm: string) {
  const params = new URLSearchParams()

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
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-destructive-foreground">
      <h2 className="text-lg font-semibold text-foreground">
        Não foi possível acessar este repositório.
      </h2>
      <p className="mt-2 text-sm text-destructive-foreground/80">
        O repositório {repositoryFullName} está configurado no admin, mas o
        GitHub não liberou o conteúdo para o servidor. Verifique se o
        GITHUB_ADMIN_TOKEN tem acesso a este repositório privado e permissão de
        leitura/escrita em Contents.
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
              href={withSearchParam(
                getRepositoryFolderHref(repository, folder.path),
                rawSearchTerm,
              )}
              title={folder.path}
              className={cn(
                "flex h-8 min-w-0 items-center gap-2 rounded-md px-2 text-sm transition",
                isActive
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
              )}
              style={{ paddingLeft: `${8 + depth * 16}px` }}
            >
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/70" />
              <Folder className="size-4 shrink-0 text-primary" />
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
          className="mt-1 flex h-8 min-w-0 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground transition hover:bg-secondary/70 hover:text-foreground"
          style={{ paddingLeft: `${24 + depth * 16}px` }}
        >
          <FileText className="size-4 shrink-0 text-muted-foreground/70" />
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
    <div className="rounded-lg border border-border bg-card/70 p-8 text-center">
      <FolderOpen className="mx-auto size-10 text-primary" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-foreground">Pasta vazia</h2>
      <p className="mt-2 text-sm text-muted-foreground">
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
    <div className="rounded-lg border border-border bg-card/70 p-8 text-center">
      <Search className="mx-auto size-10 text-primary" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        Nenhum resultado encontrado
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
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
    const [directory, repositoryFiles] = await Promise.all([
      getRepositoryDirectory(repository, currentPath),
      getRepositoryFiles(repository),
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
            href={withSearchParam(
              getRepositoryFolderHref(repository, item.path),
              rawSearchTerm,
            )}
            className="group rounded-lg border border-border bg-card/75 p-5 transition hover:border-primary/40 hover:bg-secondary/60"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Folder className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-foreground group-hover:text-primary">
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
            className="group rounded-lg border border-border bg-card/75 p-5 transition hover:border-primary/40 hover:bg-secondary/60"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FileText className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-foreground group-hover:text-primary">
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
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <RepositoryIcon className="size-4" aria-hidden="true" />
              {repositoryConfig.explorerEyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">
              {repositoryConfig.explorerTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Navegue pela mesma estrutura de pastas do repositório{" "}
              {repositoryFullName}.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90"
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
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                name="q"
                defaultValue={rawSearchTerm}
                placeholder={repositoryConfig.searchPlaceholder}
                className="h-11 border-border bg-card/75 pr-3 pl-10 text-foreground placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-primary/20"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                className="h-11 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Search className="size-4" aria-hidden="true" />
                Pesquisar
              </Button>
              {rawSearchTerm ? (
                <Button
                  asChild
                  type="button"
                  variant="outline"
                  className="h-11 border-border bg-card/50 text-foreground hover:bg-secondary hover:text-foreground"
                >
                  <Link
                    href={withSearchParam(
                      getRepositoryFolderHref(repository, currentPath),
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

        <RepositoryTreeLayout
          tree={
            <>
            <Link
              href={withSearchParam(
                getRepositoryFolderHref(repository),
                rawSearchTerm,
              )}
              className={cn(
                "mb-2 flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium transition",
                currentPath
                  ? "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                  : "bg-primary/10 text-foreground",
              )}
            >
              <FolderOpen className="size-4 text-primary" aria-hidden="true" />
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
              <p className="px-2 py-3 text-sm text-muted-foreground">
                Nenhum arquivo encontrado.
              </p>
            )}
            </>
          }
        >
          {contentGrid}
        </RepositoryTreeLayout>
      </section>
    )
  } catch (error) {
    if (error instanceof InvalidMeetingPathError) {
      notFound()
    }

    if (error instanceof GitHubContentNotFoundError && currentPath) {
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
