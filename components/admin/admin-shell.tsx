"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  BookOpenText,
  FileText,
  GraduationCap,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
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
  userImage?: string | null
  initials: string
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
    href: "/admin/members",
    label: "Membros",
    Icon: Users,
  },
]

function UserAvatar({
  image,
  initials,
  userName,
}: {
  image?: string | null
  initials: string
  userName: string
}) {
  if (image) {
    return (
      <img
        src={image}
        alt={`Foto de perfil de ${userName}`}
        className="size-10 shrink-0 rounded-full border border-cyan-400/25 bg-slate-900 object-cover"
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-slate-800 text-sm font-semibold text-cyan-200">
      {initials || "GI"}
    </div>
  )
}

export function AdminShell({
  children,
  userName,
  userEmail,
  userImage,
  initials,
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
    <div className="min-h-screen bg-transparent text-slate-100 pt-16">
      <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col lg:flex-row">
        <aside
          className={cn(
            "border-b border-cyan-400/15 bg-background/90 px-5 py-5 backdrop-blur-md transition-[width,padding] duration-200 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:border-r lg:border-b-0 z-40",
            isCollapsed ? "lg:w-20 lg:px-3" : "lg:w-72 lg:px-5",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed
                ? "justify-between lg:flex-col lg:justify-center"
                : "justify-between",
            )}
          >
            <div
              className={cn(
                "flex min-w-0 items-center gap-3",
                isCollapsed && "lg:justify-center",
              )}
            >
              <UserAvatar
                image={userImage}
                initials={initials}
                userName={userName}
              />
              <div className={cn("min-w-0", isCollapsed && "lg:hidden")}>
                <p className="truncate text-sm font-medium text-cyan-300">
                  Grind ICMC
                </p>
                <p className="truncate text-base font-semibold text-white">
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
              className="border border-cyan-400/15 text-cyan-200 hover:bg-cyan-300/10 hover:text-white"
            >
              <ToggleIcon className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <nav className="mt-8 space-y-2">
            {ADMIN_NAV_ITEMS.map(({ href, label, Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`)

              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  title={label}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-md border px-3 text-sm font-medium transition",
                    isActive
                      ? "border-cyan-400/20 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/15 hover:text-white"
                      : "border-transparent text-slate-300 hover:border-cyan-400/15 hover:bg-slate-900 hover:text-white",
                    isCollapsed && "lg:justify-center lg:px-0",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className={cn(isCollapsed && "lg:hidden")}>
                    {label}
                  </span>
                </Link>
              )
            })}
          </nav>

          <div
            className={cn(
              "mt-8 border-t border-cyan-400/15 pt-5 lg:absolute lg:bottom-5",
              isCollapsed ? "lg:right-3 lg:left-3" : "lg:right-5 lg:left-5",
            )}
          >
            <div
              className={cn(
                "mb-4 flex items-center gap-3",
                isCollapsed && "lg:justify-center",
              )}
            >
              <UserAvatar
                image={userImage}
                initials={initials}
                userName={userName}
              />
              <div className={cn("min-w-0", isCollapsed && "lg:hidden")}>
                <p className="truncate text-sm font-medium text-white">
                  {userName}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {userEmail ?? "GitHub autorizado"}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              aria-label={isSigningOut ? "Saindo" : "Sair"}
              title={isSigningOut ? "Saindo" : "Sair"}
              disabled={isSigningOut}
              onClick={handleSignOut}
              className={cn(
                "w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white",
                isCollapsed && "lg:justify-center lg:px-0",
              )}
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className={cn(isCollapsed && "lg:hidden")}>
                {isSigningOut ? "Saindo..." : "Sair"}
              </span>
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}
