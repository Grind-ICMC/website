import {
  BookOpenText,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"

import {
  getAdminRepositoryConfig,
  type AdminRepositorySlug,
} from "@/lib/admin-repositories"
import { getRepositoryFolderHref } from "@/lib/github-meetings"

type MeetingBreadcrumbsProps = {
  repository: AdminRepositorySlug
  path: string
}

const REPOSITORY_ICONS: Record<AdminRepositorySlug, LucideIcon> = {
  meetings: CalendarDays,
  docs: BookOpenText,
  studies: GraduationCap,
  "psel-empresas": BriefcaseBusiness,
}

export function MeetingBreadcrumbs({
  repository,
  path,
}: MeetingBreadcrumbsProps) {
  const segments = path.split("/").filter(Boolean)
  const RepositoryIcon = REPOSITORY_ICONS[repository]

  return (
    <nav
      aria-label="Caminho da pasta"
      className="mb-6 flex flex-wrap items-center gap-2 text-sm"
    >
      <Link
        href={getRepositoryFolderHref(repository)}
        className="flex items-center gap-2 font-medium text-cyan-300 transition hover:text-cyan-100"
      >
        <RepositoryIcon className="size-4" aria-hidden="true" />
        {getAdminRepositoryConfig(repository).navLabel}
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
