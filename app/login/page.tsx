import { auth, getMissingGitHubAuthEnvVars, signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { ParticlesBackground } from "@/components/particles-background"
import { Github, LockKeyhole } from "lucide-react"
import { redirect } from "next/navigation"

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
      <main className="flex min-h-screen items-center justify-center px-6 pt-24 pb-16 text-slate-100">
        <section className="w-full max-w-md rounded-lg border border-cyan-400/20 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/30">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-md bg-cyan-300 text-slate-950">
              <LockKeyhole className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase text-cyan-300">
                Grind ICMC
              </p>
              <h1 className="text-2xl font-semibold text-white">
                Painel administrativo
              </h1>
            </div>
          </div>

          {isUnauthorized ? (
            <div className="mb-6 rounded-md border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
              Acesso restrito a membros da organização Grind-ICMC no GitHub.
            </div>
          ) : null}

          {!isGitHubAuthConfigured || error === "Configuration" ? (
            <div className="mb-6 rounded-md border border-amber-300/30 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
              Configure {missingGitHubAuthEnvVarsLabel} no servidor e reinicie
              o Next para ativar o login com GitHub.
            </div>
          ) : null}

          <form action={signInWithGitHub}>
            <input type="hidden" name="redirectTo" value={callbackUrl} />
            <Button
              type="submit"
              disabled={!isGitHubAuthConfigured}
              className="h-11 w-full bg-cyan-300 text-slate-950 hover:bg-cyan-200"
            >
              <Github className="size-4" aria-hidden="true" />
              Entrar com GitHub
            </Button>
          </form>
        </section>
      </main>
    </div>
  )
}
