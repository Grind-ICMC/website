import { ArrowUpRight, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAdminRepositoryConfig, getRepositoryFullName, getRepositoryGitHubUrl, type AdminRepositorySlug } from "@/lib/admin-repositories"

export function RepositoryGitHubLink({ repository, compact = false }: { repository: AdminRepositorySlug; compact?: boolean }) {
  const config = getAdminRepositoryConfig(repository)
  return (
    <Button asChild type="button" variant="outline" size="sm" className="shrink-0 gap-2">
      <a href={getRepositoryGitHubUrl(config)} target="_blank" rel="noreferrer" aria-label={`Abrir ${getRepositoryFullName(config)} no GitHub (nova aba)`} title={`Abrir ${getRepositoryFullName(config)} no GitHub`}>
        <Github className="size-4" aria-hidden="true" />
        {!compact && <><span className="hidden sm:inline">GitHub</span><ArrowUpRight className="size-3.5" aria-hidden="true" /></>}
      </a>
    </Button>
  )
}
