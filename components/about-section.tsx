"use client"

import { useState } from "react"
import { 
  Calendar, 
  Code2, 
  MessageSquare, 
  FileText, 
  Star, 
  Users,
  Info
} from "lucide-react"
import { useLanguage } from "@/components/language-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
        <div className="reading-copy reading-heading text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("about.title")}
          </h2>
          <div className="mt-2 mx-auto w-24 h-1 bg-primary rounded-full" />
        </div>

        {/* Mission Statement */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="liquid-glass rounded-2xl border p-8 text-center">
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
                className="liquid-glass group relative rounded-xl border p-6 transition-all hover:border-primary/50"
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
        <Dialog open={showAlumniInfo} onOpenChange={setShowAlumniInfo}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <DialogTitle>
                  {language === "pt" ? "O que é Alumni?" : "What is Alumni?"}
                </DialogTitle>
              </div>
              <DialogDescription>
                {alumniInfoText}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
