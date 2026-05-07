"use client"

import Link from "next/link"
import { ExternalLink, Youtube, ListVideo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-context"

// Real playlists from Grind ICMC YouTube channel
const grindPlaylists = [
  {
    id: "PLji7qLrxGQR0UpfQijy7Kqm7x0Hq-Ciut",
    titlePt: "LeetCode - Hard",
    titleEn: "LeetCode - Hard",
    descriptionPt: "Resoluções e dicas para os problemas difíceis do LeetCode.",
    descriptionEn: "Solutions and tips for LeetCode hard problems.",
  },
  {
    id: "PLji7qLrxGQR3sTAee7oxdP18-QVs6Myp1",
    titlePt: "LeetCode - Medium",
    titleEn: "LeetCode - Medium",
    descriptionPt: "Problemas de nível intermediário do LeetCode com soluções detalhadas.",
    descriptionEn: "Medium difficulty LeetCode problems with detailed solutions.",
  },
  {
    id: "PLji7qLrxGQR3DIfmwmpKZifL040GrPtx_",
    titlePt: "LeetCode - Easy",
    titleEn: "LeetCode - Easy",
    descriptionPt: "Introdução aos problemas do LeetCode e fundamentos de programação.",
    descriptionEn: "Introduction to LeetCode problems and programming fundamentals.",
  },
]

export function ContentSection() {
  const { t, language } = useLanguage()

  return (
    <section id="content" className="py-12 lg:py-20 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("content.title")}
          </h2>
          <div className="mt-2 mx-auto w-24 h-1 bg-primary rounded-full" />
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            {t("content.desc")}
          </p>
        </div>

        {/* Playlists Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto mb-10">
          {grindPlaylists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`https://www.youtube.com/playlist?list=${playlist.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl border border-border bg-card/50 transition-all hover:border-primary/50 hover:scale-[1.02]"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-red-600/30 via-secondary to-red-600/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90 text-white transition-transform group-hover:scale-110">
                    <ListVideo className="h-5 w-5" />
                  </div>
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="font-medium text-foreground line-clamp-2 text-sm group-hover:text-primary transition-colors">
                  {language === "pt" ? playlist.titlePt : playlist.titleEn}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {language === "pt" ? playlist.descriptionPt : playlist.descriptionEn}
                </p>
              </div>
              {/* External link indicator */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="h-4 w-4 text-primary" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-red-600 text-white hover:bg-red-700 gap-2"
            asChild
          >
            <Link
              href="https://www.youtube.com/@GrindICMC"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Youtube className="h-5 w-5" />
              {t("content.cta")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
