import { auth, getMissingGitHubAuthEnvVars, signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { ParticlesBackground } from "@/components/particles-background"
import {
  ArrowUpRight,
  CalendarClock,
  Github,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react"
import { redirect } from "next/navigation"
import { FaInstagram } from "react-icons/fa"

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[]
    error?: string | string[]
  }>
}

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function getSafeRedirectPath(
  value: FormDataEntryValue | string | null | undefined,
) {
  if (typeof value !== "string") {
    return "/admin/meetings"
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/admin/meetings"
  }

  return value
}

const instagramUrl = "https://www.instagram.com/grind.icmc/"

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth()

  if (session?.user) {
    redirect("/admin/meetings")
  }

  const params = await searchParams
  const error = getSearchParam(params.error)
  const callbackUrl = getSafeRedirectPath(getSearchParam(params.callbackUrl))
  const isUnauthorized = error === "Unauthorized" || error === "AccessDenied"
  const missingGitHubAuthEnvVars = getMissingGitHubAuthEnvVars()
  const isGitHubAuthConfigured = missingGitHubAuthEnvVars.length === 0
  const missingGitHubAuthEnvVarsLabel = isGitHubAuthConfigured
    ? "as credenciais OAuth do GitHub"
    : missingGitHubAuthEnvVars.join(" e ")

  async function signInWithGitHub(formData: FormData) {
    "use server"

    if (getMissingGitHubAuthEnvVars().length > 0) {
      redirect("/login?error=Configuration")
    }

    await signIn("github", {
      redirectTo: getSafeRedirectPath(formData.get("redirectTo")),
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticlesBackground />
      <Navbar />
      <main className="relative z-10">
        <section className="relative min-h-[85vh] flex items-center pt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <section className="space-y-7">
                <div className="inline-flex">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    Acesso interno
                  </span>
                </div>

                <div className="space-y-5">
                  <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                    Entrada para pessoas membras do Grind ICMC
                  </h1>
                  <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                    Esta página é reservada para quem já faz parte do grupo e
                    precisa acessar os materiais, encontros e registros internos.
                    O acesso acontece pelo GitHub usado na organização do Grind.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card/30 p-5 backdrop-blur-sm">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h2 className="font-semibold text-foreground">
                      Para membros ativos
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Entre com a conta GitHub vinculada ao grupo para continuar
                      para a área administrativa.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/30 p-5 backdrop-blur-sm">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CalendarClock className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h2 className="font-semibold text-foreground">
                      Quer participar?
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      As novidades do processo seletivo aparecem primeiro nas
                      nossas redes sociais.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card/60 p-6 shadow-2xl shadow-primary/5 backdrop-blur-sm sm:p-8">
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <LockKeyhole className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">
                      Grind ICMC
                    </p>
                    <h2 className="text-2xl font-bold text-foreground">
                      Área de membros
                    </h2>
                  </div>
                </div>

                <p className="mb-6 leading-relaxed text-muted-foreground">
                  Se você já é membro do grupo, entre com o GitHub para acessar o
                  ambiente interno. Se ainda não é, acompanhe o Instagram para
                  saber quando abrirem as inscrições para o processo seletivo.
                </p>

                {isUnauthorized ? (
                  <div className="mb-6 rounded-xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
                    Acesso restrito a membros da organização Grind-ICMC no
                    GitHub.
                  </div>
                ) : null}

                {!isGitHubAuthConfigured || error === "Configuration" ? (
                  <div className="mb-6 rounded-xl border border-amber-300/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
                    Configure {missingGitHubAuthEnvVarsLabel} no servidor e
                    reinicie o Next para ativar o login com GitHub.
                  </div>
                ) : null}

                <form action={signInWithGitHub}>
                  <input type="hidden" name="redirectTo" value={callbackUrl} />
                  <Button
                    type="submit"
                    disabled={!isGitHubAuthConfigured}
                    size="lg"
                    className="w-full"
                  >
                    <Github className="h-5 w-5" aria-hidden="true" />
                    Entrar com GitHub
                  </Button>
                </form>

                <div className="mt-8 border-t border-border pt-6">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Ainda não faz parte? Fique de olho no nosso Instagram para
                    não perder a abertura das próximas inscrições.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-4 w-full gap-2 border-border bg-background/30 hover:bg-secondary"
                  >
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaInstagram className="h-5 w-5" aria-hidden="true" />
                      @grind.icmc
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
