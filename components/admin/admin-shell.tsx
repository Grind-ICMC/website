"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  BriefcaseBusiness,
  BookOpenText,
  FileText,
  GraduationCap,
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

  useEffect(() => {
    setIsCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true")
    setHasHydrated(true)
  }, [])

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed))
  }, [hasHydrated, isCollapsed])

  return (
    <div className="min-h-screen bg-transparent pt-16 text-slate-100">
      <div className="min-h-[calc(100vh-4rem)] w-full">
        <aside
          className={cn(
            "z-40 border-b border-cyan-400/15 bg-slate-950/[0.94] px-4 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-[width,padding] duration-200 lg:fixed lg:top-16 lg:bottom-0 lg:left-0 lg:flex lg:h-[calc(100vh-4rem)] lg:flex-col lg:border-r lg:border-b-0",
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
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.16)]">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </div>
                <div className={cn("min-w-0", isCollapsed && "lg:hidden")}>
                  <p className="truncate text-xs font-medium uppercase tracking-[0.18em] text-cyan-300/75">
                    Grind ICMC
                  </p>
                  <p className="truncate text-lg font-semibold text-white">
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
                  "hidden border border-cyan-400/15 text-cyan-200 hover:bg-cyan-300/10 hover:text-white lg:inline-flex",
                  isCollapsed && "lg:mt-1",
                )}
              >
                <ToggleIcon className="size-4" aria-hidden="true" />
              </Button>
            </div>

            <nav className="mt-5 flex min-h-0 flex-1 flex-row gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-4">
              {ADMIN_NAV_ITEMS.map(({ href, label, Icon }) => {
                const isActive =
                  pathname === href || pathname.startsWith(`${href}/`)

                return (
                  <Link
                    key={href}
                    href={href}
                    aria-label={label}
                    title={label}
                    className={cn(
                      "group relative flex h-11 shrink-0 items-center gap-3 overflow-hidden rounded-md border px-3 text-sm font-medium transition lg:w-full",
                      isActive
                        ? "border-cyan-300/25 bg-cyan-300/[0.12] text-cyan-50 shadow-[inset_3px_0_0_rgba(103,232,249,0.9)]"
                        : "border-transparent text-slate-300 hover:border-cyan-400/15 hover:bg-white/[0.04] hover:text-white",
                      isCollapsed && "lg:w-11 lg:justify-center lg:px-0",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition",
                        isActive
                          ? "text-cyan-200"
                          : "text-slate-400 group-hover:text-cyan-200",
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
                "mt-4 border-t border-cyan-400/15 pt-4",
                isCollapsed && "lg:w-full",
              )}
            >
              <div
                className={cn(
                  "mb-3 rounded-md border border-cyan-400/15 bg-white/[0.03] px-3 py-3",
                  isCollapsed && "lg:hidden",
                )}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
                  <p className="truncate text-sm font-medium text-white">
                    {userName}
                  </p>
                </div>
                <p className="truncate text-xs text-slate-400">
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
                  "h-10 w-full justify-start border border-transparent text-slate-300 hover:border-cyan-400/15 hover:bg-white/[0.04] hover:text-white",
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
            "min-w-0 px-5 py-8 transition-[padding] duration-200 sm:px-8 lg:px-10",
            isCollapsed ? "lg:pl-[7rem]" : "lg:pl-[20rem]",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
