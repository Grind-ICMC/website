"use client"

import { useState } from "react"
import { FaGithub } from "react-icons/fa"
import { useLanguage } from "@/components/language-context"

type TeamMember = {
  id: number
  login: string
  avatarUrl: string
  htmlUrl: string
  isAlumni: boolean
  role: {
    pt: string
    en: string
  }
}

type Tab = "current" | "alumni"

type TeamSectionProps = {
  members: TeamMember[]
}

export function TeamSection({ members }: TeamSectionProps) {
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState<Tab>("current")

  const currentMembers = members.filter((member) => !member.isAlumni)
  const alumniMembers = members.filter((member) => member.isAlumni)
  const hasAlumni = alumniMembers.length > 0
  const selectedTab =
    hasAlumni && activeTab === "alumni" ? "alumni" : "current"
  const visibleMembers =
    selectedTab === "alumni" ? alumniMembers : currentMembers

  return (
    <section id="team" className="py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("team.title")}
          </h2>
          <div className="mt-2 mx-auto w-24 h-1 bg-primary rounded-full" />
        </div>

        {hasAlumni ? (
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-xl border border-border bg-card/50 p-1">
              <button
                onClick={() => setActiveTab("current")}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedTab === "current"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {language === "pt" ? "Membros Atuais" : "Current Members"}
              </button>
              <button
                onClick={() => setActiveTab("alumni")}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedTab === "alumni"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {language === "pt" ? "Membros Alumni" : "Alumni Members"}
              </button>
            </div>
          </div>
        ) : null}

        {/* Team Grid */}
        {visibleMembers.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {visibleMembers.map((member) => (
              <div
                key={member.id}
                className="group relative overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 text-center transition-all hover:border-primary/50"
              >
                {/* Alumni Badge */}
                {member.isAlumni && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      Alumni
                    </span>
                  </div>
                )}

                {/* Avatar */}
                <img
                  src={member.avatarUrl}
                  alt={`Avatar de ${member.login}`}
                  className="mx-auto mb-4 h-20 w-20 rounded-full border border-primary/20 bg-primary/10 object-cover"
                />

                {/* Info */}
                <h3 className="text-lg font-semibold text-foreground">
                  @{member.login}
                </h3>
                <p className="text-sm text-primary font-medium">
                  {language === "pt" ? member.role.pt : member.role.en}
                </p>

                {/* Social Links */}
                <div className="mt-4 flex justify-center gap-3">
                  <a
                    href={member.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 items-center justify-center gap-2 rounded-lg bg-secondary px-3 text-sm text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    aria-label={`Perfil de ${member.login} no GitHub`}
                  >
                    <FaGithub className="h-4 w-4" />
                    GitHub
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
            {language === "pt"
              ? "Não foi possível carregar os membros no momento."
              : "Unable to load members right now."}
          </div>
        )}
      </div>
    </section>
  )
}
