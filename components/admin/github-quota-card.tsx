"use client"

import { useEffect, useState } from "react"
import { Clock3, Gauge, Info, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import type { GitHubRateLimit } from "@/lib/github-rate-limit"

type GitHubQuotaCardProps = {
  quota: GitHubRateLimit | null
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value)
}

function formatRemainingTime(milliseconds: number) {
  const totalMinutes = Math.max(0, Math.ceil(milliseconds / 60_000))

  if (totalMinutes === 0) return "agora"

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours} h`

  return `${hours} h ${minutes} min`
}

function formatResetDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value))
}

export function GitHubQuotaCard({ quota }: GitHubQuotaCardProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [currentQuota, setCurrentQuota] = useState(quota)
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    let isCurrent = true

    async function refreshQuota() {
      try {
        const response = await fetch("/api/admin/github-rate-limit", {
          cache: "no-store",
        })

        if (!response.ok) {
          return
        }

        const nextQuota = (await response.json()) as GitHubRateLimit
        if (isCurrent) {
          setCurrentQuota(nextQuota)
        }
      } catch {
        // Keep the last successfully loaded value visible if GitHub is unavailable.
      }
    }

    void refreshQuota()
    const interval = window.setInterval(refreshQuota, 60_000)

    return () => {
      isCurrent = false
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const updateNow = () => setNow(Date.now())

    updateNow()
    const interval = window.setInterval(updateNow, 30_000)

    return () => window.clearInterval(interval)
  }, [])

  const percentage = currentQuota
    ? Math.min(100, Math.max(0, (currentQuota.used / currentQuota.limit) * 100))
    : 0
  const isWarning = percentage >= 70
  const isCritical = percentage >= 90
  const statusLabel = !currentQuota
    ? "Indisponível"
    : isCritical
      ? "Atenção necessária"
      : isWarning
        ? "Acompanhar de perto"
        : "Dentro do esperado"
  const resetRemaining = currentQuota && now !== null
    ? formatRemainingTime(new Date(currentQuota.resetAt).getTime() - now)
    : "calculando…"

  return (
    <>
      <section className="mb-10 overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/80 to-card/60 p-5 shadow-[0_16px_45px_color-mix(in_oklab,var(--primary)_8%,transparent)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <Gauge className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary/80">
                Saúde da integração
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                Quota da API do GitHub
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Acompanhe o uso da API que mantém os documentos do admin conectados ao GitHub.
              </p>
            </div>
          </div>

          <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
            !currentQuota
              ? "border-border bg-secondary/60 text-muted-foreground"
              : isCritical
                ? "border-red-400/30 bg-red-400/10 text-red-200"
                : isWarning
                  ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
                  : "border-primary/25 bg-primary/10 text-primary"
          }`}>
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
            {statusLabel}
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end">
          <div>
            <div className="mb-2 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold tracking-tight text-foreground">
                  {currentQuota ? `${percentage.toFixed(1)}%` : "Indisponível"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">da quota usada</p>
              </div>
              {currentQuota ? (
                <p className="text-right text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{formatNumber(currentQuota.used)}</span> de {formatNumber(currentQuota.limit)} requisições
                </p>
              ) : (
                <p className="text-right text-xs text-muted-foreground">Não foi possível consultar agora.</p>
              )}
            </div>
            <Progress
              value={percentage}
              aria-label={currentQuota ? `${percentage.toFixed(1)}% da quota usada` : "Quota indisponível"}
              className="h-2.5 bg-primary/10"
            />
            {currentQuota ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {formatNumber(currentQuota.remaining)} requisições restantes nesta janela.
              </p>
            ) : null}
          </div>

          <div className="rounded-lg border border-border/80 bg-background/30 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <Clock3 className="size-3.5 text-primary" aria-hidden="true" />
              Próximo reset
            </div>
            <p className="mt-2 text-xl font-semibold text-foreground">{resetRemaining}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {currentQuota ? `por volta de ${formatResetDate(currentQuota.resetAt)}` : "Horário indisponível"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end border-t border-border/70 pt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsInfoOpen(true)}
            className="w-fit text-primary hover:bg-primary/10 hover:text-primary"
          >
            <Info className="size-4" aria-hidden="true" />
            Saiba mais
          </Button>
        </div>
      </section>

      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent className="border-primary/20 bg-slate-950 text-slate-100 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
              Sobre a plataforma
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Uma visão rápida sobre a arquitetura atual e o próximo passo possível para o grupo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm leading-7 text-slate-300">
            <p>
              Hoje, a plataforma não usa um banco de dados tradicional. Está tudo bem: manter os documentos no GitHub é ótimo, porque temos histórico, organização e controle das alterações em um só lugar.
            </p>
            <p>
              O ponto de atenção é a quota da API do GitHub, porque usamos a versão gratuita. Até o momento isso não se tornou um problema para o grupo, mas pode se tornar com o aumento do número de membros e do uso da plataforma.
            </p>
            <p>
              Uma sugestão é solicitar uma VM ao ICMC, algo tranquilo de conseguir, para termos mais autonomia caso a demanda cresça. Ainda assim, manter tudo organizado neste site parece uma opção melhor do que um Google Drive, que se perde com mais facilidade, oferece menos controle e não garante o mesmo anonimato.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
