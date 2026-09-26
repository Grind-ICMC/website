"use client"

import { useEffect, useState, type MouseEvent, type ReactNode } from "react"
import Link from "next/link"
import {
  BriefcaseBusiness,
  BookOpenText,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  type LucideIcon,
} from "lucide-react"
import { signOut as clientSignOut } from "next-auth/react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { AdminSidebarFileTree, type AdminSidebarFileSummary } from "@/components/admin/admin-sidebar-file-tree"
import { cn } from "@/lib/utils"
import type { AdminRepositorySlug } from "@/lib/admin-repositories"

const SIDEBAR_STORAGE_KEY = "grind-admin-sidebar-collapsed"

type AdminShellProps = {
  children: ReactNode
  userName: string
  userEmail?: string | null
  repositoryTrees: Partial<Record<AdminRepositorySlug, AdminSidebarFileSummary[]>>
}

type AdminNavItem = {
  href: string
  label: string
  Icon: LucideIcon
  repository?: AdminRepositorySlug
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Início",
    Icon: LayoutDashboard,
  },
  {
    href: "/admin/meetings",
    label: "Atas da Reunião",
    Icon: FileText,
    repository: "meetings",
  },
  {
    href: "/admin/docs",
    label: "Docs",
    Icon: BookOpenText,
    repository: "docs",
  },
  {
    href: "/admin/studies",
    label: "Studies",
    Icon: GraduationCap,
    repository: "studies",
  },
  {
    href: "/admin/psel-empresas",
    label: "PSEL Empresas",
    Icon: BriefcaseBusiness,
    repository: "psel-empresas",
  },
  {
    href: "/admin/members",
    label: "Membros",
    Icon: Users,
  },
]

export function AdminShell({ children, userName, userEmail, repositoryTrees }: AdminShellProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHoverExpanded, setIsHoverExpanded] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [treeCollapseSignals, setTreeCollapseSignals] = useState<Partial<Record<AdminRepositorySlug, number>>>({})
  const isSidebarExpanded = !isCollapsed || isHoverExpanded
  const ToggleIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose

  async function handleSignOut() {
    if (isSigningOut) {
      return
    }

    setIsSigningOut(true)

    try {
      const result = await clientSignOut({
        redirect: false,
        redirectTo: "/",
      })

      window.location.replace(result.url || "/")
    } catch {
      window.location.replace("/")
    }
  }

  function handleSidebarClick(event: MouseEvent<HTMLElement>) {
    const target = event.target

    if (!(target instanceof HTMLElement)) {
      return
    }

    if (target.closest('a, button, input, textarea, select, [role="button"], [role="dialog"]')) {
      return
    }

    setIsHoverExpanded(false)
    setIsCollapsed((current) => !current)
  }

  useEffect(() => {
    setIsCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true")
    setHasHydrated(true)
  }, [])

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    document.documentElement.style.setProperty(
      "--admin-sidebar-offset",
      isSidebarExpanded ? "20rem" : "7rem",
    )
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed))

    return () => {
      document.documentElement.style.removeProperty("--admin-sidebar-offset")
    }
  }, [hasHydrated, isCollapsed, isSidebarExpanded])

  return (
    <div className="min-h-screen bg-transparent pt-16 text-foreground">
      <div className="min-h-[calc(100vh-4rem)] w-full">
        <aside
          data-admin-sidebar
          onClick={handleSidebarClick}
          onMouseEnter={() => {
            if (isCollapsed) setIsHoverExpanded(true)
          }}
          onMouseLeave={() => setIsHoverExpanded(false)}
          className={cn(
            "z-40 border-b border-border bg-card/95 px-4 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-[width,padding,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:fixed lg:top-0 lg:bottom-0 lg:left-0 lg:z-[60] lg:flex lg:h-screen lg:cursor-pointer lg:flex-col lg:border-r lg:border-b-0",
            isSidebarExpanded ? "lg:w-72 lg:px-5" : "lg:w-20 lg:px-5",
          )}
        >
          <div className={cn("flex h-full min-h-0 flex-col", !isSidebarExpanded && "lg:items-center")}>
            <div
              className={cn("flex items-center justify-between gap-3", !isSidebarExpanded && "lg:flex-col lg:justify-center")}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className={cn("min-w-0", !isSidebarExpanded && "lg:hidden")}>
                  <p className="truncate text-lg font-semibold text-foreground">Painel Admin</p>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
                title={isCollapsed ? "Expandir menu" : "Recolher menu"}
                onClick={() => setIsCollapsed((current) => !current)}
                className={cn(
                  "hidden border border-border text-muted-foreground transition-colors duration-300 hover:bg-primary/10 hover:text-foreground lg:inline-flex",
                  isCollapsed && "lg:mt-1",
                )}
              >
                <ToggleIcon className="size-4" aria-hidden="true" />
              </Button>
            </div>

            <nav className="admin-sidebar-scroll mt-5 flex min-h-0 flex-1 flex-row gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-4">
              {ADMIN_NAV_ITEMS.map(({ href, label, Icon, repository }) => {
                const isActive =
                  href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
                const isRootPage = repository ? pathname === href : false
                const files = repository ? repositoryTrees[repository] : undefined

                return (
                  <div key={href} className="min-w-0 shrink-0 lg:w-full">
                    <Link
                      href={href}
                      aria-label={label}
                      title={label}
                      onClick={(event) => {
                        if (!repository || !isRootPage) return

                        setTreeCollapseSignals((current) => ({
                          ...current,
                          [repository]: (current[repository] ?? 0) + 1,
                        }))

                        event.preventDefault()
                      }}
                      className={cn(
                        "group relative flex h-11 items-center gap-3 overflow-hidden rounded-md border px-3 text-sm font-medium transition lg:w-full",
                        isActive
                          ? "border-primary/25 bg-primary/10 text-foreground shadow-[inset_3px_0_0_var(--primary)]"
                          : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/70 hover:text-foreground",
                        !isSidebarExpanded && "lg:w-11 lg:justify-center lg:px-0",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                        )}
                        aria-hidden="true"
                      />
                      <span className={cn("truncate", !isSidebarExpanded && "lg:hidden")}>{label}</span>
                    </Link>
                    {repository && isActive && isSidebarExpanded && files ? (
                      <div className="hidden lg:block">
                        <AdminSidebarFileTree
                          repository={repository}
                          files={files}
                          collapseSignal={treeCollapseSignals[repository]}
                        />
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </nav>

            <div className={cn("mt-4 border-t border-border pt-4", !isSidebarExpanded && "lg:w-full")}>
              <div
                className={cn(
                  "mb-3 rounded-md border border-border bg-secondary/35 px-3 py-3",
                  !isSidebarExpanded && "lg:hidden",
                )}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary shadow-[0_0_14px_var(--primary)]" />
                  <p className="truncate text-sm font-medium text-foreground">{userName}</p>
                </div>
                <p className="truncate text-xs text-muted-foreground">{userEmail ?? "GitHub autorizado"}</p>
              </div>

              <Button
                type="button"
                variant="ghost"
                aria-label={isSigningOut ? "Saindo" : "Sair"}
                title={isSigningOut ? "Saindo" : "Sair"}
                disabled={isSigningOut}
                onClick={handleSignOut}
                className={cn(
                  "h-10 w-full justify-start border border-transparent text-muted-foreground hover:border-border hover:bg-secondary/70 hover:text-foreground",
                  !isSidebarExpanded && "lg:justify-center lg:px-0",
                )}
              >
                <LogOut className="size-4" aria-hidden="true" />
                <span className={cn(!isSidebarExpanded && "lg:hidden")}>{isSigningOut ? "Saindo..." : "Sair"}</span>
              </Button>
            </div>
          </div>
        </aside>

        <main
          className={cn(
            "min-w-0 px-5 py-8 transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-8 lg:px-10",
            isSidebarExpanded ? "lg:pl-[20rem]" : "lg:pl-[7rem]",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
