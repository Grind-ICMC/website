"use client"

import { useEffect, useState, type ReactNode } from "react"
import { FolderTree, PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TREE_STORAGE_KEY = "grind-admin-repository-tree-collapsed"

type RepositoryTreeLayoutProps = {
  tree: ReactNode
  children: ReactNode
}

export function RepositoryTreeLayout({
  tree,
  children,
}: RepositoryTreeLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)
  const ToggleIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose

  useEffect(() => {
    setIsCollapsed(localStorage.getItem(TREE_STORAGE_KEY) === "true")
    setHasHydrated(true)
  }, [])

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    localStorage.setItem(TREE_STORAGE_KEY, String(isCollapsed))
  }, [hasHydrated, isCollapsed])

  return (
    <div
      className={cn(
        "grid gap-5 transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] xl:grid-cols-[19rem_minmax(0,1fr)]",
        isCollapsed && "xl:grid-cols-[4.25rem_minmax(0,1fr)]",
      )}
    >
      <aside
        onClick={() => {
          if (isCollapsed) {
            setIsCollapsed(false)
          }
        }}
        className={cn(
          "max-h-[calc(100vh-14rem)] overflow-auto rounded-lg border border-border bg-card/70 p-3 transition-[padding,background-color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isCollapsed && "cursor-pointer overflow-hidden p-2",
        )}
      >
        <div
          className={cn(
            "mb-3 flex items-center justify-between gap-2 border-b border-border pb-3",
            isCollapsed && "justify-center border-b-0 pb-0",
          )}
        >
          <div
            className={cn(
              "flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground",
              isCollapsed && "hidden",
            )}
          >
            <FolderTree className="size-4 text-primary" aria-hidden="true" />
            <span className="truncate">Arquivos</span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isCollapsed ? "Expandir árvore" : "Minimizar árvore"}
            title={isCollapsed ? "Expandir árvore" : "Minimizar árvore"}
            onClick={(event) => {
              event.stopPropagation()
              setIsCollapsed((current) => !current)
            }}
            className="shrink-0 border border-border text-muted-foreground hover:bg-primary/10 hover:text-foreground"
          >
            <ToggleIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>

        {isCollapsed ? (
          <button
            type="button"
            aria-label="Expandir árvore de arquivos"
            title="Expandir árvore de arquivos"
            onClick={() => setIsCollapsed(false)}
            className="flex h-14 w-full items-center justify-between rounded-md border border-border bg-secondary/35 px-3 py-2 text-muted-foreground transition hover:border-primary/30 hover:bg-primary/10 hover:text-foreground xl:h-56 xl:flex-col xl:px-2 xl:py-3"
          >
            <FolderTree className="size-5 text-primary" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] xl:rotate-180 xl:[writing-mode:vertical-rl]">
              Arquivos
            </span>
            <PanelLeftOpen className="size-4" aria-hidden="true" />
          </button>
        ) : null}

        <div className={cn(isCollapsed && "hidden")}>{tree}</div>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  )
}
