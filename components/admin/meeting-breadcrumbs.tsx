import { ChevronRight } from "lucide-react"
import Link from "next/link"

import type { AdminRepositorySlug } from "@/lib/admin-repositories"
import { getRepositoryFolderHref } from "@/lib/github-meetings"

type MeetingBreadcrumbsProps = {
  repository: AdminRepositorySlug
  path: string
}

export function MeetingBreadcrumbs({
  repository,
  path,
}: MeetingBreadcrumbsProps) {
  const segments = path.split("/").filter(Boolean)

  return (
    <nav
      aria-label="Caminho da pasta"
      className="mb-6 flex flex-wrap items-center gap-2 text-sm"
    >
      <Link
        href={getRepositoryFolderHref(repository)}
        className="font-medium text-cyan-300 transition hover:text-cyan-100"
      >
        Root
      </Link>
      {segments.map((segment, index) => {
        const href = getRepositoryFolderHref(
          repository,
          segments.slice(0, index + 1).join("/"),
        )

        return (
          <div key={`${segment}-${index}`} className="flex items-center gap-2">
            <ChevronRight className="size-4 text-slate-600" aria-hidden="true" />
            <Link
              href={href}
              className="font-medium text-slate-300 transition hover:text-cyan-100"
            >
              {segment}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}
