"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import {
  BriefcaseBusiness,
  BookOpenText,
  FileText,
  GraduationCap,
  LogOut,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react"
import { signOut as clientSignOut } from "next-auth/react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  const [isSigningOut, setIsSigningOut] = useState(false)

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

  return (
    <div className="min-h-screen bg-transparent pt-16 text-slate-100">
      <div className="min-h-[calc(100vh-4rem)] w-full">
        <aside
          className="z-40 border-b border-cyan-400/15 bg-slate-950/[0.94] px-4 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl lg:fixed lg:top-16 lg:bottom-0 lg:left-0 lg:flex lg:h-[calc(100vh-4rem)] lg:w-72 lg:flex-col lg:border-r lg:border-b-0 lg:px-5"
        >
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.16)]">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium uppercase tracking-[0.18em] text-cyan-300/75">
                    Grind ICMC
                  </p>
                  <p className="truncate text-lg font-semibold text-white">
                    Admin
                  </p>
                </div>
              </div>
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
                    <span className="truncate">{label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="mt-4 border-t border-cyan-400/15 pt-4">
              <div className="mb-3 rounded-md border border-cyan-400/15 bg-white/[0.03] px-3 py-3">
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
                className="h-10 w-full justify-start border border-transparent text-slate-300 hover:border-cyan-400/15 hover:bg-white/[0.04] hover:text-white"
              >
                <LogOut className="size-4" aria-hidden="true" />
                <span>{isSigningOut ? "Saindo..." : "Sair"}</span>
              </Button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:pl-[20rem]">
          {children}
        </main>
      </div>
    </div>
  )
}
