"use client"

import { BookOpen, Users, Target, Trophy } from "lucide-react"
import { useLanguage } from "@/components/language-context"

export function HowItWorksSection() {
  const { language } = useLanguage()

  const steps = language === "pt" 
    ? [
        {
          icon: BookOpen,
          title: "Escolha uma Frente",
          description: "Entre em Engineering ou Science de acordo com seus objetivos em software, ML, dados, análise ou pesquisa aplicada.",
        },
        {
          icon: Users,
          title: "Evolua por Camadas",
          description: "Use Starter, Pro e Soft Skills para organizar fundamentos, aprofundamento técnico e comunicação.",
        },
        {
          icon: Target,
          title: "Pratique com a Comunidade",
          description: "Resolva problemas, discuta cases, leia papers, revise projetos e participe de mock interviews.",
        },
        {
          icon: Trophy,
          title: "Aplique em Processos Reais",
          description: "Use o repertório construído para entrevistas, estágios, vagas, pesquisa, projetos e oportunidades em tecnologia.",
        },
      ]
    : [
        {
          icon: BookOpen,
          title: "Choose a Front",
          description: "Join Engineering or Science according to your goals in software, ML, data, analysis, or applied research.",
        },
        {
          icon: Users,
          title: "Progress Through Layers",
          description: "Use Starter, Pro, and Soft Skills to organize foundations, technical depth, and communication.",
        },
        {
          icon: Target,
          title: "Practice with the Community",
          description: "Solve problems, discuss cases, read papers, review projects, and join mock interviews.",
        },
        {
          icon: Trophy,
          title: "Apply in Real Processes",
          description: "Use the repertoire you build for interviews, internships, jobs, research, projects, and tech opportunities.",
        },
      ]

  return (
    <section id="how-it-works" className="py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {language === "pt" ? "Como Funciona" : "How It Works"}
          </h2>
          <div className="mt-2 mx-auto w-24 h-1 bg-primary rounded-full" />
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative text-center">
                {/* Connector Line (hidden on mobile and last item) */}
                {index < steps.length - 1 && (
                  <div className="absolute top-8 left-1/2 hidden h-0.5 w-full bg-border lg:block" />
                )}
                
                {/* Step Number */}
                <div className="relative z-10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background">
                  <Icon className="h-7 w-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
