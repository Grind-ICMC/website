"use client"

import { useState } from "react"
import { 
  Calendar, 
  Code2, 
  MessageSquare, 
  FileText, 
  Star, 
  Users,
  Info,
  X
} from "lucide-react"
import { useLanguage } from "@/components/language-context"

const features = [
  { icon: Calendar, key: "about.feature1" },
  { icon: Code2, key: "about.feature2" },
  { icon: MessageSquare, key: "about.feature3" },
  { icon: FileText, key: "about.feature4" },
  { icon: Star, key: "about.feature5" },
  { icon: Users, key: "about.feature6", hasInfo: true },
]

export function AboutSection() {
  const { t, language } = useLanguage()
  const [showAlumniInfo, setShowAlumniInfo] = useState(false)

  const alumniInfoText = language === "pt" 
    ? "Alumni é uma rede de ex-alunos que já se formaram na Universidade de São Paulo (USP) e mantêm contato com o grupo por terem participado no passado. Eles compartilham experiências, mentoram membros atuais e ajudam na ponte entre a universidade e o mercado de trabalho."
    : "Alumni is a network of former students who have graduated from the University of São Paulo (USP) and maintain contact with the group because they participated in the past. They share experiences, mentor current members, and help bridge the gap between university and the job market."

  return (
    <section id="about" className="py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("about.title")}
          </h2>
          <div className="mt-2 mx-auto w-24 h-1 bg-primary rounded-full" />
        </div>

        {/* Mission Statement */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("about.mission")}
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative rounded-xl border border-border bg-card/30 p-6 transition-all hover:border-primary/50 hover:bg-card/50"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {t(feature.key)}
                      </h3>
                      {feature.hasInfo && (
                        <button
                          onClick={() => setShowAlumniInfo(true)}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          aria-label={language === "pt" ? "O que é Alumni?" : "What is Alumni?"}
                        >
                          <Info className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Alumni Info Modal */}
        {showAlumniInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowAlumniInfo(false)}
            />
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
              <button
                onClick={() => setShowAlumniInfo(false)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                aria-label={language === "pt" ? "Fechar" : "Close"}
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {language === "pt" ? "O que é Alumni?" : "What is Alumni?"}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {alumniInfoText}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
