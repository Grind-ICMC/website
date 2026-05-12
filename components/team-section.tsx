"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
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

const MEMBERS_PER_PAGE = 8

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

  const currentMembers = members.filter((member) => !member.isAlumni)
  const alumniMembers = members.filter((member) => member.isAlumni)
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
        behavior: "smooth",
        block: "start",
      })
    })
  }

  const changeTab = (tab: Tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {paginatedMembers.map((member) => (
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

            {pageCount > 1 ? (
              <Pagination className="mt-10" aria-label={t("team.pagination")}>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="default"
                      className="gap-1 px-2.5 sm:pl-2.5"
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
                            variant={page === currentPage ? "outline" : "ghost"}
                            size="icon"
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
                      className="gap-1 px-2.5 sm:pr-2.5"
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
