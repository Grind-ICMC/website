"use client"

import Link from "next/link"
import Image from "next/image"
import { ExternalLink, Brain, Globe, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-context"

export function ICMCSection() {
  const { t } = useLanguage()

  const bullets = [
    { icon: Brain, key: "icmc.bullet1" },
    { icon: Globe, key: "icmc.bullet2" },
    { icon: Users, key: "icmc.bullet3" },
  ]

  return (
    <section id="icmc" className="py-12 lg:py-20 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {t("icmc.title")}
              </h2>
              <div className="mt-2 w-24 h-1 bg-primary rounded-full" />
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {t("icmc.desc")}
            </p>

            <ul className="space-y-4 mb-8">
              {bullets.map((bullet, idx) => {
                const Icon = bullet.icon
                return (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-foreground">
                      {t(bullet.key)}
                    </span>
                  </li>
                )
              })}
            </ul>

            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              asChild
            >
              <Link
                href="https://www.icmc.usp.br/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("icmc.cta")}
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Logo / Image */}
          <div className="relative flex justify-center items-center lg:justify-end">
            <div className="relative w-full max-w-sm aspect-square bg-white/5 rounded-2xl p-8 border border-border shadow-xl flex items-center justify-center overflow-hidden">
              <Image 
                src="/icmc-logo.svg" 
                alt="ICMC USP Logo" 
                fill
                className="object-contain p-8"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
