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
        "grid gap-5 transition-[grid-template-columns] duration-200 xl:grid-cols-[19rem_minmax(0,1fr)]",
        isCollapsed && "xl:grid-cols-[3.5rem_minmax(0,1fr)]",
      )}
    >
      <aside
        className={cn(
          "max-h-[calc(100vh-14rem)] overflow-auto rounded-lg border border-cyan-400/15 bg-slate-950/70 p-3 transition-[padding] duration-200",
          isCollapsed && "overflow-hidden xl:p-2",
        )}
      >
        <div
          className={cn(
            "mb-3 flex items-center justify-between gap-2 border-b border-cyan-400/10 pb-3",
            isCollapsed && "justify-center border-b-0 pb-0",
          )}
        >
          <div
            className={cn(
              "flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-200",
              isCollapsed && "hidden",
            )}
          >
            <FolderTree className="size-4 text-cyan-300" aria-hidden="true" />
            <span className="truncate">Arquivos</span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isCollapsed ? "Expandir árvore" : "Minimizar árvore"}
            title={isCollapsed ? "Expandir árvore" : "Minimizar árvore"}
            onClick={() => setIsCollapsed((current) => !current)}
            className="shrink-0 border border-cyan-400/15 text-cyan-200 hover:bg-cyan-300/10 hover:text-white"
          >
            <ToggleIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className={cn(isCollapsed && "hidden")}>{tree}</div>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  )
}
