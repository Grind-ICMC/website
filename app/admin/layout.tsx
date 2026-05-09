import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { FileText, LogOut, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const userName = session.user.name ?? session.user.email ?? "Membro"
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  async function signOutAction() {
    "use server"

    await signOut({ redirectTo: "/" })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-cyan-400/15 bg-slate-950/95 px-5 py-5 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-r lg:border-b-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-cyan-300 text-slate-950">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-300">Grind ICMC</p>
              <p className="text-base font-semibold text-white">Admin</p>
            </div>
          </div>

          <nav className="mt-8">
            <Link
              href="/admin/meetings"
              className="flex items-center gap-3 rounded-md border border-cyan-400/20 bg-cyan-300/10 px-3 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15 hover:text-white"
            >
              <FileText className="size-4" aria-hidden="true" />
              Atas da Reunião
            </Link>
          </nav>

          <div className="mt-8 border-t border-cyan-400/15 pt-5 lg:absolute lg:right-5 lg:bottom-5 lg:left-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-800 text-sm font-semibold text-cyan-200">
                {initials || "GI"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {userName}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {session.user.email ?? "GitHub autorizado"}
                </p>
              </div>
            </div>

            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sair
              </Button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}
