import { auth } from "@/auth"
import { AdminShell } from "@/components/admin/admin-shell"
import { Navbar } from "@/components/navbar"
import { ParticlesBackground } from "@/components/particles-background"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
}

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

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticlesBackground />
      <Navbar />
      <AdminShell
        userName={userName}
        userEmail={session.user.email}
      >
        {children}
      </AdminShell>
    </div>
  )
}
