import { ExternalLink, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getOrganizationMembers } from "@/lib/github-members"

export const dynamic = "force-dynamic"

function MembersError() {
  return (
    <div className="rounded-lg border border-red-400/25 bg-red-950/30 p-6 text-red-100">
      <h2 className="text-lg font-semibold text-white">
        Não foi possível carregar os membros.
      </h2>
      <p className="mt-2 text-sm text-red-100/80">
        Verifique a visibilidade pública da organização ou o acesso do token
        GitHub no servidor.
      </p>
    </div>
  )
}

export default async function MembersPage() {
  try {
    const members = await getOrganizationMembers({
      cache: "no-store",
    })

    return (
      <section>
        <header className="mb-8 border-b border-cyan-400/15 pb-6">
          <p className="flex items-center gap-2 text-sm font-medium text-cyan-300">
            <Users className="size-4" aria-hidden="true" />
            Membros
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Membros do Grind ICMC
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Perfis públicos vinculados à organização Grind-ICMC no GitHub.
          </p>
        </header>

        {members.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {members.map((member) => (
              <article
                key={member.id}
                className="rounded-lg border border-cyan-400/15 bg-slate-900/75 p-5 transition hover:border-cyan-300/40 hover:bg-slate-900"
              >
                <div className="flex flex-col items-center text-center">
                  <img
                    src={member.avatarUrl}
                    alt={`Avatar de ${member.login}`}
                    className="size-20 rounded-full border border-cyan-400/20 bg-slate-950 object-cover"
                  />
                  <h2 className="mt-4 max-w-full truncate text-base font-semibold text-white">
                    @{member.login}
                  </h2>
                  <Button
                    asChild
                    size="sm"
                    className="mt-4 bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                  >
                    <a
                      href={member.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver Perfil
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-cyan-400/15 bg-slate-900/70 p-8 text-center">
            <Users
              className="mx-auto size-10 text-cyan-300"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold text-white">
              Nenhum membro público encontrado
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              O GitHub só retorna membros com associação pública neste endpoint.
            </p>
          </div>
        )}
      </section>
    )
  } catch {
    return (
      <section>
        <header className="mb-8 border-b border-cyan-400/15 pb-6">
          <p className="flex items-center gap-2 text-sm font-medium text-cyan-300">
            <Users className="size-4" aria-hidden="true" />
            Membros
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Membros do Grind ICMC
          </h1>
        </header>
        <MembersError />
      </section>
    )
  }
}
