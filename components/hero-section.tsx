"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { FaGithub } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-context"

export function HeroSection() {
  const { language, t } = useLanguage()

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
              {language === "pt" ? (
                <>
                  {t("hero.title")}{" "}
                  <span className="text-primary">{t("hero.titleHighlight")}</span>
                </>
              ) : (
                <>
                  {t("hero.title")}{" "}
                  <span className="text-primary">{t("hero.titleHighlight")}</span>{" "}
                  interviews
                </>
              )}
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

          {/* Right Illustration - Code block without background */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Code illustration - clean, no outer background */}
              <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-2xl shadow-primary/5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-muted-foreground font-mono">solution.js</span>
                </div>
                <pre className="text-sm font-mono text-muted-foreground overflow-hidden">
                  <code>
                    <span className="text-primary">{"function"}</span>{" "}
                    <span className="text-foreground">{"twoSum"}</span>
                    {"(nums, target) {\n"}
                    {"  "}
                    <span className="text-primary">{"const"}</span>
                    {" map = "}
                    <span className="text-primary">{"new"}</span>
                    {" Map();\n\n"}
                    {"  "}
                    <span className="text-primary">{"for"}</span>
                    {" ("}
                    <span className="text-primary">{"let"}</span>
                    {" i = 0; i < nums.length; i++) {\n"}
                    {"    "}
                    <span className="text-primary">{"const"}</span>
                    {" complement = target - nums[i];\n\n"}
                    {"    "}
                    <span className="text-primary">{"if"}</span>
                    {" (map.has(complement)) {\n"}
                    {"      "}
                    <span className="text-primary">{"return"}</span>
                    {" [map.get(complement), i];\n"}
                    {"    }\n\n"}
                    {"    map.set(nums[i], i);\n"}
                    {"  }\n\n"}
                    {"  "}
                    <span className="text-primary">{"return"}</span>
                    {" [];\n"}
                    {"}"}
                  </code>
                </pre>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center rounded bg-green-500/10 text-green-500 px-2 py-0.5 font-medium">
                      O(n)
                    </span>
                    <span>Time Complexity</span>
                    <span className="mx-2 text-border">|</span>
                    <span className="inline-flex items-center rounded bg-primary/10 text-primary px-2 py-0.5 font-medium">
                      O(n)
                    </span>
                    <span>Space</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
