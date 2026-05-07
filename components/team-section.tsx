"use client"

import { useState } from "react"
import Link from "next/link"
import { FaLinkedin, FaGithub } from "react-icons/fa"
import { useLanguage } from "@/components/language-context"

const currentMembers = [
  {
    name: "Luiz Felipe",
    role: "Presidente",
    roleEn: "President",
    company: "Software Engineer Intern @ iFood",
    initials: "LF",
    linkedin: "#",
    github: "#",
  },
  {
    name: "João Pedro",
    role: "Vice-Presidente",
    roleEn: "Vice President",
    company: "Software Engineer Intern @ Uber",
    initials: "JP",
    linkedin: "#",
    github: "#",
  },
  {
    name: "Pedro Kenzo",
    role: "Board",
    roleEn: "Board",
    company: "Machine Learning Engineer @ QuintoAndar",
    initials: "PK",
    linkedin: "#",
    github: "#",
  },
  {
    name: "Breno",
    role: "Board",
    roleEn: "Board",
    company: "Software Engineer @ VTEX",
    initials: "B",
    linkedin: "#",
    github: "#",
  },
]

const alumniMembers = [
  {
    name: "Carlos Silva",
    role: "Ex-Presidente",
    roleEn: "Former President",
    company: "Senior Software Engineer @ Google",
    initials: "CS",
    linkedin: "#",
    github: "#",
  },
  {
    name: "Marina Santos",
    role: "Ex-Board",
    roleEn: "Former Board",
    company: "Software Engineer @ Meta",
    initials: "MS",
    linkedin: "#",
    github: "#",
  },
  {
    name: "Rafael Oliveira",
    role: "Ex-Board",
    roleEn: "Former Board",
    company: "Backend Engineer @ Nubank",
    initials: "RO",
    linkedin: "#",
    github: "#",
  },
  {
    name: "Ana Costa",
    role: "Ex-Membro",
    roleEn: "Former Member",
    company: "Software Engineer @ Amazon",
    initials: "AC",
    linkedin: "#",
    github: "#",
  },
]

type Tab = "current" | "alumni"

export function TeamSection() {
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState<Tab>("current")

  const members = activeTab === "current" ? currentMembers : alumniMembers

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

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-xl border border-border bg-card/50 p-1">
            <button
              onClick={() => setActiveTab("current")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "current"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {language === "pt" ? "Membros Atuais" : "Current Members"}
            </button>
            <button
              onClick={() => setActiveTab("alumni")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "alumni"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {language === "pt" ? "Membros Alumni" : "Alumni Members"}
            </button>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 text-center transition-all hover:border-primary/50"
            >
              {/* Alumni Badge */}
              {activeTab === "alumni" && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Alumni
                  </span>
                </div>
              )}

              {/* Avatar */}
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
                {member.initials}
              </div>
              
              {/* Info */}
              <h3 className="text-lg font-semibold text-foreground">
                {member.name}
              </h3>
              <p className="text-sm text-primary font-medium">
                {language === "pt" ? member.role : member.roleEn}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {member.company}
              </p>

              {/* Social Links */}
              <div className="mt-4 flex justify-center gap-3">
                <Link
                  href={member.linkedin}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={`${member.name}'s LinkedIn`}
                >
                  <FaLinkedin className="h-4 w-4" />
                </Link>
                <Link
                  href={member.github}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={`${member.name}'s GitHub`}
                >
                  <FaGithub className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
