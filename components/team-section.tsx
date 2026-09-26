"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react"
import { FaGithub } from "react-icons/fa"
import { useLanguage } from "@/components/language-context"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination"

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

const MEMBERS_PER_PAGE = 20

function leadershipRank(member: TeamMember) {
  const role = member.role.pt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR")
  if (role.includes("presidente") && !role.includes("vice")) return 0
  if (role.includes("vice-presidente") || role.includes("vice presidente")) return 1
  return 2
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages = new Set([1, totalPages, currentPage])

  if (currentPage > 1) {
    pages.add(currentPage - 1)
  }

  if (currentPage < totalPages) {
    pages.add(currentPage + 1)
  }

  return Array.from(pages).sort((a, b) => a - b)
}

export function TeamSection({ members }: TeamSectionProps) {
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState<Tab>("current")
  const [currentPage, setCurrentPage] = useState(1)

  const currentMembers = members.filter((member) => !member.isAlumni).toSorted((a, b) => leadershipRank(a) - leadershipRank(b))
  const alumniMembers = members.filter((member) => member.isAlumni).toSorted((a, b) => leadershipRank(a) - leadershipRank(b))
  const hasAlumni = alumniMembers.length > 0
  const selectedTab =
    hasAlumni && activeTab === "alumni" ? "alumni" : "current"
  const visibleMembers =
    selectedTab === "alumni" ? alumniMembers : currentMembers
  const pageCount = Math.ceil(visibleMembers.length / MEMBERS_PER_PAGE)
  const paginatedMembers = useMemo(() => {
    const pageStart = (currentPage - 1) * MEMBERS_PER_PAGE

    return visibleMembers.slice(pageStart, pageStart + MEMBERS_PER_PAGE)
  }, [currentPage, visibleMembers])
  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, pageCount),
    [currentPage, pageCount],
  )

  useEffect(() => {
    if (pageCount > 0 && currentPage > pageCount) {
      setCurrentPage(pageCount)
    }
  }, [currentPage, pageCount])

  const changePage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), pageCount)

    if (nextPage === currentPage) {
      return
    }

    setCurrentPage(nextPage)
    requestAnimationFrame(() => {
      document.getElementById("team")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "start",
      })
    })
  }

  const changeTab = (tab: Tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  return (
    <section id="team" className="scroll-mt-24 py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="reading-copy mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {language === "pt" ? "Quem faz acontecer" : "The people behind Grind"}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("team.title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {language === "pt"
              ? "Gente que aprende junto, compartilha experiências e abre caminhos. Conheça quem constrói o Grind."
              : "Learning together, sharing experiences, and opening doors. Meet the people building Grind."}
          </p>
        </div>

        {hasAlumni ? (
          <div className="flex mb-8">
            <div className="liquid-glass inline-flex rounded-xl border p-1">
              <button
                type="button"
                aria-pressed={selectedTab === "current"}
                onClick={() => changeTab("current")}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedTab === "current"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("team.currentMembers")}
              </button>
              <button
                type="button"
                aria-pressed={selectedTab === "alumni"}
                onClick={() => changeTab("alumni")}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedTab === "alumni"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("team.alumniMembers")}
              </button>
            </div>
          </div>
        ) : null}

        {/* Team Grid */}
        {visibleMembers.length ? (
          <>
            <div className="reading-copy grid gap-x-12 md:grid-cols-2" aria-label={t("team.title")}>
              {paginatedMembers.map((member) => (
                <a
                  key={member.id}
                  href={member.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={language === "pt" ? `Perfil de ${member.login} no GitHub (nova aba)` : `${member.login} on GitHub (new tab)`}
                  className="group flex min-w-0 items-center gap-4 border-b border-white/10 py-6 transition-colors hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:gap-5"
                >
                  {/* Avatar */}
                  <img
                    src={member.avatarUrl}
                    alt=""
                    loading="lazy"
                    width={80}
                    height={80}
                    className="size-16 shrink-0 rounded-full bg-primary/10 object-cover ring-1 ring-white/10 sm:size-20"
                  />

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                      @{member.login}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {language === "pt" ? member.role.pt : member.role.en}
                      {member.isAlumni ? " · Alumni" : ""}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FaGithub className="size-3.5" aria-hidden="true" /> GitHub
                    </span>
                  </div>
                  <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
                </a>
              ))}
            </div>

            {pageCount > 1 ? (
              <Pagination className="mt-8" aria-label={t("team.pagination")}>
                <PaginationContent className="gap-1.5">
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="default"
                      className="team-pagination-control h-10 gap-1 rounded-full px-3 text-muted-foreground transition-colors hover:text-foreground sm:pl-3"
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label={t("team.previousPage")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:block">
                        {t("team.previous")}
                      </span>
                    </Button>
                  </PaginationItem>

                  {visiblePages.map((page, index) => {
                    const previousPage = visiblePages[index - 1]
                    const hasGap = previousPage && page - previousPage > 1

                    return (
                      <Fragment key={page}>
                        {hasGap ? (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : null}
                        <PaginationItem>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`team-pagination-control size-10 rounded-full font-medium transition-colors ${page === currentPage ? "team-pagination-current" : "text-muted-foreground hover:text-foreground"}`}
                            onClick={() => changePage(page)}
                            aria-current={
                              page === currentPage ? "page" : undefined
                            }
                            aria-label={t("team.page").replace(
                              "{page}",
                              String(page),
                            )}
                          >
                            {page}
                          </Button>
                        </PaginationItem>
                      </Fragment>
                    )
                  })}

                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="default"
                      className="team-pagination-control h-10 gap-1 rounded-full px-3 text-muted-foreground transition-colors hover:text-foreground sm:pr-3"
                      onClick={() => changePage(currentPage + 1)}
                      disabled={currentPage === pageCount}
                      aria-label={t("team.nextPage")}
                    >
                      <span className="hidden sm:block">{t("team.next")}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            ) : null}
          </>
        ) : (
          <div className="liquid-glass rounded-xl border p-8 text-center text-sm text-muted-foreground">
            {language === "pt"
              ? "Não foi possível carregar os membros no momento."
              : "Unable to load members right now."}
          </div>
        )}
      </div>
    </section>
  )
}
