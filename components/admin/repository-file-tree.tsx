import { ChevronRight, FileText, Folder, FolderOpen } from "lucide-react"
import Link from "next/link"

import type { AdminRepositorySlug } from "@/lib/admin-repositories"
import {
  getRepositoryDocumentHref,
  getRepositoryFolderHref,
  type RepositoryDocumentSummary,
} from "@/lib/github-meetings"
import { cn } from "@/lib/utils"

type RepositoryTreeNode = {
  name: string
  path: string
  folders: RepositoryTreeNode[]
  files: RepositoryDocumentSummary[]
}

type RepositoryFileTreeProps = {
  repository: AdminRepositorySlug
  files: RepositoryDocumentSummary[]
  currentFolderPath: string
  rawSearchTerm?: string
  activeDocumentPath?: string
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

function withSearchParam(href: string, rawSearchTerm = "") {
  const params = new URLSearchParams()

  if (rawSearchTerm) {
    params.set("q", rawSearchTerm)
  }

  const query = params.toString()
  return query ? `${href}?${query}` : href
}

function RepositoryTreeBranch({
  node,
  repository,
  currentFolderPath,
  rawSearchTerm,
  activeDocumentPath,
  depth = 0,
}: {
  node: RepositoryTreeNode
  repository: AdminRepositorySlug
  currentFolderPath: string
  rawSearchTerm?: string
  activeDocumentPath?: string
  depth?: number
}) {
  return (
    <div className={depth ? "mt-1" : undefined}>
      {node.folders.map((folder) => {
        const isActive = folder.path === currentFolderPath

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
            <RepositoryTreeBranch
              node={folder}
              repository={repository}
              currentFolderPath={currentFolderPath}
              rawSearchTerm={rawSearchTerm}
              activeDocumentPath={activeDocumentPath}
              depth={depth + 1}
            />
          </div>
        )
      })}

      {node.files.map((file) => {
        const isActive = file.path === activeDocumentPath

        return (
          <Link
            key={file.path}
            href={getRepositoryDocumentHref(repository, file.path)}
            title={file.path}
            className={cn(
              "mt-1 flex h-8 min-w-0 items-center gap-2 rounded-md px-2 text-sm transition",
              isActive
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
            )}
            style={{ paddingLeft: `${24 + depth * 16}px` }}
          >
            <FileText className="size-4 shrink-0 text-muted-foreground/70" />
            <span className="truncate">{file.title}</span>
          </Link>
        )
      })}
    </div>
  )
}

export function RepositoryFileTree({
  repository,
  files,
  currentFolderPath,
  rawSearchTerm,
  activeDocumentPath,
}: RepositoryFileTreeProps) {
  const repositoryTree = buildRepositoryTree(files)

  return (
    <>
      <Link
        href={withSearchParam(getRepositoryFolderHref(repository), rawSearchTerm)}
        className={cn(
          "mb-2 flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium transition",
          currentFolderPath
            ? "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
            : "bg-primary/10 text-foreground",
        )}
      >
        <FolderOpen className="size-4 text-primary" aria-hidden="true" />
        Root
      </Link>
      {files.length ? (
        <RepositoryTreeBranch
          node={repositoryTree}
          repository={repository}
          currentFolderPath={currentFolderPath}
          rawSearchTerm={rawSearchTerm}
          activeDocumentPath={activeDocumentPath}
        />
      ) : (
        <p className="px-2 py-3 text-sm text-muted-foreground">
          Nenhum arquivo encontrado.
        </p>
      )}
    </>
  )
}
