import Link from "next/link"
import {
  ArrowRight,
  BookOpenText,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ADMIN_REPOSITORIES } from "@/lib/admin-repositories"

const repositoryIcons = {
  meetings: CalendarDays,
  docs: BookOpenText,
  studies: GraduationCap,
  "psel-empresas": BriefcaseBusiness,
}

const highlights = [
  {
    title: "Conteúdo vivo",
    description:
      "A central existe para registrar materiais, atas, estudos e referências que os membros podem manter sempre atualizados.",
    Icon: Sparkles,
  },
  {
    title: "Acesso interno",
    description:
      "Este espaço é exclusivo para membros do Grind ICMC autenticados pelo GitHub da organização.",
    Icon: ShieldCheck,
  },
  {
    title: "Memória do grupo",
    description:
      "Cada repositório ajuda a organizar o que já foi produzido e facilita a continuidade entre gestões e frentes.",
    Icon: Users,
  },
]

export default function AdminPage() {
  return (
    <section>
      <div className="mb-10 max-w-3xl">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Central de Admin
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-foreground">
          Base interna do Grind ICMC
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Este painel concentra os documentos internos do grupo. A ideia é que
          membros mantenham tudo atualizado com materiais úteis, registros de
          reuniões, estudos, processos seletivos de empresas e referências que
          ajudam o Grind a continuar evoluindo.
        </p>
      </div>

      <div className="mb-10 grid gap-4 md:grid-cols-3">
        {highlights.map(({ title, description, Icon }) => (
          <div
            key={title}
            className="rounded-lg border border-border bg-card/70 p-5"
          >
            <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Repositórios internos
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Escolha uma área para navegar pelos arquivos.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {ADMIN_REPOSITORIES.map((repository) => {
            const Icon = repositoryIcons[repository.slug]

            return (
              <Link
                key={repository.slug}
                href={`/admin/${repository.slug}`}
                className="group rounded-lg border border-border bg-card/75 p-5 transition hover:border-primary/40 hover:bg-secondary/60"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary">
                      {repository.navLabel}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {repository.explorerTitle}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </Link>
            )
          })}
        </div>

        <Button
          asChild
          className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/admin/meetings">
            Abrir atas
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
