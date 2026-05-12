export const ADMIN_REPOSITORIES = [
  {
    slug: "meetings",
    owner: "Grind-ICMC",
    repo: "meetings",
    navLabel: "Atas da Reunião",
    explorerEyebrow: "Atas da Reunião",
    explorerTitle: "Documentação interna",
    documentLabel: "ata",
    documentLabelPlural: "atas",
    createHeading: "Criar ata",
    createButtonLabel: "Novo Documento",
    createSubmitLabel: "Criar documento",
    searchPlaceholder: "Pesquisar atas e pastas",
    emptyDirectoryDescription:
      "Crie uma pasta ou documento para começar a organizar as atas aqui.",
  },
  {
    slug: "docs",
    owner: "Grind-ICMC",
    repo: "docs",
    navLabel: "Docs",
    explorerEyebrow: "Docs",
    explorerTitle: "Documentação",
    documentLabel: "documento",
    documentLabelPlural: "documentos",
    createHeading: "Criar documento",
    createButtonLabel: "Novo Documento",
    createSubmitLabel: "Criar documento",
    searchPlaceholder: "Pesquisar documentos e pastas",
    emptyDirectoryDescription:
      "Crie uma pasta ou documento para começar a organizar a documentação aqui.",
  },
  {
    slug: "studies",
    owner: "Grind-ICMC",
    repo: "studies",
    navLabel: "Studies",
    explorerEyebrow: "Studies",
    explorerTitle: "Estudos",
    documentLabel: "estudo",
    documentLabelPlural: "estudos",
    createHeading: "Criar estudo",
    createButtonLabel: "Novo Estudo",
    createSubmitLabel: "Criar estudo",
    searchPlaceholder: "Pesquisar estudos e pastas",
    emptyDirectoryDescription:
      "Crie uma pasta ou estudo para começar a organizar os estudos aqui.",
  },
] as const

export type AdminRepositoryConfig = (typeof ADMIN_REPOSITORIES)[number]
export type AdminRepositorySlug = AdminRepositoryConfig["slug"]

const ADMIN_REPOSITORY_BY_SLUG = Object.fromEntries(
  ADMIN_REPOSITORIES.map((repository) => [repository.slug, repository]),
) as Record<AdminRepositorySlug, AdminRepositoryConfig>

export function getAdminRepositoryConfig(
  slug: AdminRepositorySlug,
): AdminRepositoryConfig
export function getAdminRepositoryConfig(
  slug: string,
): AdminRepositoryConfig | undefined
export function getAdminRepositoryConfig(slug: string) {
  return ADMIN_REPOSITORY_BY_SLUG[slug as AdminRepositorySlug]
}

export function getRepositoryFullName(repository: AdminRepositoryConfig) {
  return `${repository.owner}/${repository.repo}`
}
