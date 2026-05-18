"use client"

import { useLanguage } from "@/components/language-context"
import { Navbar } from "@/components/navbar"
import { ParticlesBackground } from "@/components/particles-background"
import { Button } from "@/components/ui/button"
import {
  ArrowUpRight,
  CalendarClock,
  Github,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react"
import { FaInstagram } from "react-icons/fa"

type LoginPageContentProps = {
  callbackUrl: string
  error?: string
  isGitHubAuthConfigured: boolean
  isUnauthorized: boolean
  missingGitHubAuthEnvVars: string[]
  signInAction: (formData: FormData) => void | Promise<void>
}

const instagramUrl = "https://www.instagram.com/grind.icmc/"

export function LoginPageContent({
  callbackUrl,
  error,
  isGitHubAuthConfigured,
  isUnauthorized,
  missingGitHubAuthEnvVars,
  signInAction,
}: LoginPageContentProps) {
  const { language, t } = useLanguage()
  const missingGitHubAuthEnvVarsLabel = isGitHubAuthConfigured
    ? t("login.config.githubCredentials")
    : missingGitHubAuthEnvVars.join(language === "pt" ? " e " : " and ")

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticlesBackground />
      <Navbar />
      <main className="relative z-10">
        <section className="relative flex min-h-[85vh] items-center pt-16">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
              <section className="space-y-7">
                <div className="inline-flex">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    {t("login.badge")}
                  </span>
                </div>

                <div className="space-y-5">
                  <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {t("login.title")}
                  </h1>
                  <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                    {t("login.subtitle")}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card/30 p-5 backdrop-blur-sm">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h2 className="font-semibold text-foreground">
                      {t("login.activeMembers.title")}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t("login.activeMembers.description")}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/30 p-5 backdrop-blur-sm">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CalendarClock className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h2 className="font-semibold text-foreground">
                      {t("login.join.title")}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t("login.join.description")}
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
                      {t("login.memberArea.title")}
                    </h2>
                  </div>
                </div>

                <p className="mb-6 leading-relaxed text-muted-foreground">
                  {t("login.memberArea.description")}
                </p>

                {isUnauthorized ? (
                  <div className="mb-6 rounded-xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
                    {t("login.error.unauthorized")}
                  </div>
                ) : null}

                {!isGitHubAuthConfigured || error === "Configuration" ? (
                  <div className="mb-6 rounded-xl border border-amber-300/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
                    {t("login.config.prefix")} {missingGitHubAuthEnvVarsLabel}{" "}
                    {t("login.config.suffix")}
                  </div>
                ) : null}

                <form action={signInAction}>
                  <input type="hidden" name="redirectTo" value={callbackUrl} />
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full cursor-pointer hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.99]"
                  >
                    <Github className="h-5 w-5" aria-hidden="true" />
                    {t("login.github")}
                  </Button>
                </form>

                <div className="mt-8 border-t border-border pt-6">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t("login.instagram.description")}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-4 w-full gap-2 border-border bg-background/30 text-foreground hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
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
