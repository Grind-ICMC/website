"use client"

import { BookOpen, Users, Target, Trophy } from "lucide-react"
import { useLanguage } from "@/components/language-context"

export function HowItWorksSection() {
  const { language } = useLanguage()

  const steps = language === "pt" 
    ? [
        {
          icon: BookOpen,
          title: "Estude os Fundamentos",
          description: "Comece com algoritmos e estruturas de dados básicos através de nosso material curado.",
        },
        {
          icon: Users,
          title: "Pratique em Grupo",
          description: "Participe das sessões semanais de prática com outros membros para resolver problemas juntos.",
        },
        {
          icon: Target,
          title: "Mock Interviews",
          description: "Simule entrevistas reais com membros atuando como entrevistadores e entrevistados.",
        },
        {
          icon: Trophy,
          title: "Conquiste sua Vaga",
          description: "Aplique o conhecimento adquirido e conquiste sua vaga na Big Tech dos seus sonhos.",
        },
      ]
    : [
        {
          icon: BookOpen,
          title: "Study the Fundamentals",
          description: "Start with basic algorithms and data structures through our curated material.",
        },
        {
          icon: Users,
          title: "Practice in Groups",
          description: "Join weekly practice sessions with other members to solve problems together.",
        },
        {
          icon: Target,
          title: "Mock Interviews",
          description: "Simulate real interviews with members acting as interviewers and interviewees.",
        },
        {
          icon: Trophy,
          title: "Land Your Dream Job",
          description: "Apply the knowledge gained and land your spot at your dream Big Tech company.",
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
