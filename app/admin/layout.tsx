import { auth, signOut } from "@/auth"
import { AdminShell } from "@/components/admin/admin-shell"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
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
    <AdminShell
      userName={userName}
      userEmail={session.user.email}
      initials={initials}
      signOutAction={signOutAction}
    >
      {children}
    </AdminShell>
  )
}
