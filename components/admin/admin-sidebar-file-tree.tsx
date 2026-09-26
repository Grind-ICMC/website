"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, FileText, Folder } from "lucide-react"
import { usePathname } from "next/navigation"

import { FolderIconPreview } from "@/components/admin/folder-icon-preview"
import type { AdminRepositorySlug } from "@/lib/admin-repositories"
import { cn } from "@/lib/utils"

export type AdminSidebarFileSummary = {
  name: string
  path: string
  title: string
  directory: string
  folderIconPath?: string
  folderIconPaths?: Array<{
    path: string
    iconPath: string
  }>
}

type TreeNode = {
  name: string
  path: string
  folders: TreeNode[]
  files: AdminSidebarFileSummary[]
  iconPath?: string
}

type AdminSidebarFileTreeProps = {
  repository: AdminRepositorySlug
  files: AdminSidebarFileSummary[]
}

function createTreeNode(name: string, path: string): TreeNode {
  return { name, path, folders: [], files: [] }
}

function buildTree(files: AdminSidebarFileSummary[]) {
  const root = createTreeNode("", "")
  const folders = new Map<string, TreeNode>([["", root]])

  for (const file of files) {
    const segments = file.path.split("/")
    let parent = root
    let currentPath = ""

    for (const segment of segments.slice(0, -1)) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment
      let folder = folders.get(currentPath)

      if (!folder) {
        folder = createTreeNode(segment, currentPath)
        folders.set(currentPath, folder)
        parent.folders.push(folder)
      }

      parent = folder
    }

    for (const folderIcon of file.folderIconPaths ?? []) {
      const folder = folders.get(folderIcon.path)
      if (folder) folder.iconPath = folderIcon.iconPath
    }

    if (file.folderIconPath) {
      parent.iconPath = file.folderIconPath
    }
    parent.files.push(file)
  }

  function sortNode(node: TreeNode) {
    node.folders.sort((left, right) => left.name.localeCompare(right.name))
    node.files.sort((left, right) => left.title.localeCompare(right.title))
    node.folders.forEach(sortNode)
  }

  sortNode(root)
  return root
}

function encodePath(path: string) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")
}

function getFolderHref(repository: AdminRepositorySlug, path: string) {
  const encodedPath = encodePath(path)
  return encodedPath ? `/admin/${repository}/${encodedPath}` : `/admin/${repository}`
}

function getDocumentHref(repository: AdminRepositorySlug, path: string) {
  return `/admin/${repository}/doc/${encodePath(path)}`
}

function getActivePath(repository: AdminRepositorySlug, pathname: string) {
  const documentPrefix = `/admin/${repository}/doc/`
  const folderPrefix = `/admin/${repository}/`

  if (pathname.startsWith(documentPrefix)) {
    return pathname
      .slice(documentPrefix.length)
      .split("/")
      .map((segment) => decodeURIComponent(segment))
      .join("/")
  }

  if (pathname.startsWith(folderPrefix)) {
    return pathname
      .slice(folderPrefix.length)
      .split("/")
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment))
      .join("/")
  }

  return ""
}

function FolderBranch({
  node,
  repository,
  activePath,
  openFolders,
  toggleFolder,
  depth,
}: {
  node: TreeNode
  repository: AdminRepositorySlug
  activePath: string
  openFolders: Set<string>
  toggleFolder: (path: string) => void
  depth: number
}) {
  return (
    <div className={cn(depth > 0 && "mt-0.5")}>
      {node.folders.map((folder) => {
        const isOpen = openFolders.has(folder.path)
        const isActive = activePath === folder.path

        return (
          <div key={folder.path}>
            <div
              className="flex min-w-0 items-center gap-1"
              style={{ paddingLeft: `${depth * 14}px` }}
            >
              <button
                type="button"
                aria-label={`${isOpen ? "Recolher" : "Expandir"} pasta ${folder.name}`}
                aria-expanded={isOpen}
                onClick={() => toggleFolder(folder.path)}
                className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
              >
                <ChevronRight
                  className={cn("size-3.5 transition-transform", isOpen && "rotate-90")}
                  aria-hidden="true"
                />
              </button>
              <Link
                href={getFolderHref(repository, folder.path)}
                title={folder.path}
                className={cn(
                  "min-w-0 flex-1 truncate rounded-md px-1.5 py-1 text-xs transition",
                  isActive
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                )}
              >
                {folder.iconPath ? (
                  <FolderIconPreview
                    src={`/api/admin/${repository}/image?path=${encodeURIComponent(folder.iconPath)}`}
                    alt={`Ícone da pasta ${folder.name}`}
                    className="mr-1.5 inline-block size-5 align-middle"
                  />
                ) : (
                  <Folder className="mr-1.5 inline-block size-3.5 text-primary" aria-hidden="true" />
                )}
                {folder.name}
              </Link>
            </div>
            {isOpen ? (
              <FolderBranch
                node={folder}
                repository={repository}
                activePath={activePath}
                openFolders={openFolders}
                toggleFolder={toggleFolder}
                depth={depth + 1}
              />
            ) : null}
          </div>
        )
      })}

      {node.files.map((file) => {
        const isActive = activePath === file.path

        return (
          <Link
            key={file.path}
            href={getDocumentHref(repository, file.path)}
            title={file.title}
            className={cn(
              "mt-0.5 flex min-w-0 items-center gap-1.5 rounded-md py-1 pr-1.5 text-base transition",
              isActive
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
            )}
            style={{ paddingLeft: `${26 + depth * 14}px` }}
          >
            <FileText className="size-3.5 shrink-0 text-muted-foreground/80" aria-hidden="true" />
            <span className="truncate">{file.title}</span>
          </Link>
        )
      })}
    </div>
  )
}

export function AdminSidebarFileTree({ repository, files }: AdminSidebarFileTreeProps) {
  const pathname = usePathname()
  const tree = useMemo(() => buildTree(files), [files])
  const activePath = getActivePath(repository, pathname)
  const [openFolders, setOpenFolders] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    if (!activePath) return

    const ancestors = new Set<string>()
    const segments = activePath.split("/")
    for (let index = 1; index < segments.length; index += 1) {
      ancestors.add(segments.slice(0, index).join("/"))
    }

    setOpenFolders((current) => new Set([...current, ...ancestors]))
  }, [activePath])

  function toggleFolder(path: string) {
    setOpenFolders((current) => {
      const next = new Set(current)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  if (!files.length) {
    return <p className="px-8 py-2 text-xs text-muted-foreground">Nenhum arquivo</p>
  }

  return (
    <div className="mt-1 border-l border-border/70 pl-1">
      <FolderBranch
        node={tree}
        repository={repository}
        activePath={activePath}
        openFolders={openFolders}
        toggleFolder={toggleFolder}
        depth={0}
      />
    </div>
  )
}
