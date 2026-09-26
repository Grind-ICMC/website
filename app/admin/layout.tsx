import { auth } from "@/auth"
import { AdminShell } from "@/components/admin/admin-shell"
import { Navbar } from "@/components/navbar"
import { ParticlesBackground } from "@/components/particles-background"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import type { Metadata } from "next"
import { ADMIN_REPOSITORIES } from "@/lib/admin-repositories"
import { getRepositoryFiles } from "@/lib/github-meetings"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const userName = session.user.name ?? session.user.email ?? "Membro"
  const repositoryTreeEntries = await Promise.all(
    ADMIN_REPOSITORIES.map(async ({ slug }) => {
      try {
        return [slug, await getRepositoryFiles(slug)] as const
      } catch {
        return [slug, []] as const
      }
    }),
  )
  const repositoryTrees = Object.fromEntries(repositoryTreeEntries)

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <ParticlesBackground />
      <Navbar />
      <div className="relative z-10">
        <AdminShell userName={userName} userEmail={session.user.email} repositoryTrees={repositoryTrees}>
          {children}
        </AdminShell>
      </div>
    </div>
  )
}
