"use client"

import {
  useEffect,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react"
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
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react"
import { signOut as clientSignOut } from "next-auth/react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SIDEBAR_STORAGE_KEY = "grind-admin-sidebar-collapsed"

type AdminShellProps = {
  children: ReactNode
  userName: string
  userEmail?: string | null
}

type AdminNavItem = {
  href: string
  label: string
  Icon: LucideIcon
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
  },
  {
    href: "/admin/docs",
    label: "Docs",
    Icon: BookOpenText,
  },
  {
    href: "/admin/studies",
    label: "Studies",
    Icon: GraduationCap,
  },
  {
    href: "/admin/psel-empresas",
    label: "PSEL Empresas",
    Icon: BriefcaseBusiness,
  },
  {
    href: "/admin/members",
    label: "Membros",
    Icon: Users,
  },
]

export function AdminShell({
  children,
  userName,
  userEmail,
}: AdminShellProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
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

    if (
      target.closest(
        'a, button, input, textarea, select, [role="button"], [role="dialog"]',
      )
    ) {
      return
    }

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
      isCollapsed ? "7rem" : "20rem",
    )
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed))

    return () => {
      document.documentElement.style.removeProperty("--admin-sidebar-offset")
    }
  }, [hasHydrated, isCollapsed])

  return (
    <div className="min-h-screen bg-transparent pt-16 text-foreground">
      <div className="min-h-[calc(100vh-4rem)] w-full">
        <aside
          onClick={handleSidebarClick}
          className={cn(
            "z-40 border-b border-border bg-card/95 px-4 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-[width,padding,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:fixed lg:top-16 lg:bottom-0 lg:left-0 lg:flex lg:h-[calc(100vh-4rem)] lg:cursor-pointer lg:flex-col lg:border-r lg:border-b-0",
            isCollapsed ? "lg:w-20 lg:px-3" : "lg:w-72 lg:px-5",
          )}
        >
          <div
            className={cn(
              "flex h-full min-h-0 flex-col",
              isCollapsed && "lg:items-center",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between gap-3",
                isCollapsed && "lg:flex-col lg:justify-center",
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_16%,transparent)]">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </div>
                <div className={cn("min-w-0", isCollapsed && "lg:hidden")}>
                  <p className="truncate text-xs font-medium uppercase tracking-[0.18em] text-primary/75">
                    Grind ICMC
                  </p>
                  <p className="truncate text-lg font-semibold text-foreground">
                    Admin
                  </p>
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

            <nav className="mt-5 flex min-h-0 flex-1 flex-row gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-4">
              {ADMIN_NAV_ITEMS.map(({ href, label, Icon }) => {
                const isActive =
                  href === "/admin"
                    ? pathname === href
                    : pathname === href || pathname.startsWith(`${href}/`)

                return (
                  <Link
                    key={href}
                    href={href}
                    aria-label={label}
                    title={label}
                    className={cn(
                      "group relative flex h-11 shrink-0 items-center gap-3 overflow-hidden rounded-md border px-3 text-sm font-medium transition lg:w-full",
                      isActive
                        ? "border-primary/25 bg-primary/10 text-foreground shadow-[inset_3px_0_0_var(--primary)]"
                        : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/70 hover:text-foreground",
                      isCollapsed && "lg:w-11 lg:justify-center lg:px-0",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-primary",
                      )}
                      aria-hidden="true"
                    />
                    <span className={cn("truncate", isCollapsed && "lg:hidden")}>
                      {label}
                    </span>
                  </Link>
                )
              })}
            </nav>

            <div
              className={cn(
                "mt-4 border-t border-border pt-4",
                isCollapsed && "lg:w-full",
              )}
            >
              <div
                className={cn(
                  "mb-3 rounded-md border border-border bg-secondary/35 px-3 py-3",
                  isCollapsed && "lg:hidden",
                )}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary shadow-[0_0_14px_var(--primary)]" />
                  <p className="truncate text-sm font-medium text-foreground">
                    {userName}
                  </p>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {userEmail ?? "GitHub autorizado"}
                </p>
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
                  isCollapsed && "lg:justify-center lg:px-0",
                )}
              >
                <LogOut className="size-4" aria-hidden="true" />
                <span className={cn(isCollapsed && "lg:hidden")}>
                  {isSigningOut ? "Saindo..." : "Sair"}
                </span>
              </Button>
            </div>
          </div>
        </aside>

        <main
          className={cn(
            "min-w-0 px-5 py-8 transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-8 lg:px-10",
            isCollapsed ? "lg:pl-[7rem]" : "lg:pl-[20rem]",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
