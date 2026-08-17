"use client"

import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  ClipboardCheck,
  Code2,
  MessageSquare,
} from "lucide-react"
import { FaGithub } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-context"

export function HeroSection() {
  const { t, language } = useLanguage()

  const selectionSteps = language === "pt"
    ? [
        {
          icon: ClipboardCheck,
          title: "Triagem e currículo",
          description: "Projetos, GitHub, pesquisa e narrativa técnica",
        },
        {
          icon: Code2,
          title: "Entrevista técnica",
          description: "Coding, System Design, dados, ML ou produto",
        },
        {
          icon: BarChart3,
          title: "Cases e experimentos",
          description: "Métricas, trade-offs, modelagem e decisão",
        },
        {
          icon: MessageSquare,
          title: "Comunicação",
          description: "Mocks, feedback, storytelling e comportamento",
        },
      ]
    : [
        {
          icon: ClipboardCheck,
          title: "Screening and resume",
          description: "Projects, GitHub, research, and technical narrative",
        },
        {
          icon: Code2,
          title: "Technical interview",
          description: "Coding, System Design, data, ML, or product",
        },
        {
          icon: BarChart3,
          title: "Cases and experiments",
          description: "Metrics, trade-offs, modeling, and decisions",
        },
        {
          icon: MessageSquare,
          title: "Communication",
          description: "Mocks, feedback, storytelling, and behavior",
        },
      ]

  return (
    <section className="relative min-h-[85vh] flex items-center pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="flex flex-col gap-6">
            {/* Tag */}
            <div className="inline-flex">
              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                {t("hero.tag")}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              {t("hero.title")}{" "}
              <span className="text-primary">{t("hero.titleHighlight")}</span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
              {t("hero.subtitle")}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                asChild
              >
                <Link href="/participar">
                  {t("hero.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-border hover:bg-secondary"
                asChild
              >
                <Link
                  href="https://github.com/Grind-ICMC"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub className="h-4 w-4" />
                  {t("hero.github")}
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-2xl shadow-primary/5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-muted-foreground font-mono">
                    {language === "pt" ? "processo seletivo" : "recruiting loop"}
                  </span>
                </div>

                <div className="border-b border-border pb-5">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-xs font-semibold uppercase text-primary">
                        {language === "pt" ? "Preparação" : "Preparation"}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-foreground">
                        {language === "pt"
                          ? "Entrevistas, cases e carreira"
                          : "Interviews, cases, and career"}
                      </h3>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <span className="inline-flex items-center rounded-md bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                        Engineering
                      </span>
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        Science
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  {selectionSteps.map((step) => {
                    const Icon = step.icon

                    return (
                      <div key={step.title} className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {step.title}
                          </h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 flex items-center gap-3 border-t border-border pt-5 text-sm text-muted-foreground">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  <span>
                    {language === "pt"
                      ? "Engineering, Science e soft skills para processos reais"
                      : "Engineering, Science, and soft skills for real processes"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
