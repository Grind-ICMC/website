"use client"

import { Rocket, Zap, CheckCircle2, Users2 } from "lucide-react"
import { useLanguage } from "@/components/language-context"

export function TracksSection() {
  const { t, language } = useLanguage()

  const starterFeatures = language === "pt" 
    ? ["Algoritmos básicos", "Arrays & Hashing", "LeetCode Easy/Medium", "Preparação de currículo"]
    : ["Basic algorithms", "Arrays & Hashing", "LeetCode Easy/Medium", "Resume preparation"]

  const proFeatures = language === "pt"
    ? ["Problemas difíceis", "System Design", "Design Patterns", "IA para codificação"]
    : ["Hard problems", "System Design", "Design Patterns", "AI for coding"]

  const softSkillsFeatures = language === "pt"
    ? ["Como se vender em entrevistas", "Organizar pensamentos e comunicação", "Networking estratégico", "Entender processos end-to-end"]
    : ["How to sell yourself in interviews", "Organize thoughts and communication", "Strategic networking", "Understand end-to-end processes"]

  return (
    <section id="tracks" className="py-12 lg:py-20 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("tracks.title")}
          </h2>
          <div className="mt-2 mx-auto w-24 h-1 bg-primary rounded-full" />
        </div>

        {/* Tracks Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Starter Track */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 transition-all hover:border-primary/50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Rocket className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {t("tracks.starter.title")}
                  </h3>
                  <p className="text-sm text-primary font-medium">
                    {t("tracks.starter.focus")}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                {t("tracks.starter.desc")}
              </p>
              <ul className="space-y-3">
                {starterFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pro Track */}
          <div className="group relative overflow-hidden rounded-2xl border border-primary/50 bg-card/50 backdrop-blur-sm p-8 transition-all hover:border-primary">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                PRO
              </span>
            </div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  <Zap className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {t("tracks.pro.title")}
                  </h3>
                  <p className="text-sm text-primary font-medium">
                    {t("tracks.pro.focus")}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                {t("tracks.pro.desc")}
              </p>
              <ul className="space-y-3">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Soft Skills Track */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 transition-all hover:border-primary/50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                NEW
              </span>
            </div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users2 className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {t("tracks.softskills.title")}
                  </h3>
                  <p className="text-sm text-primary font-medium">
                    {t("tracks.softskills.focus")}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                {t("tracks.softskills.desc")}
              </p>
              <ul className="space-y-3">
                {softSkillsFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
