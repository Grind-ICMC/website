"use client"

import { useEffect, useState } from "react"
import { Check, Eye, History, Loader2, RotateCcw } from "lucide-react"

import {
  getRepositoryDocumentVersion,
  restoreRepositoryDocumentVersion,
} from "@/app/actions/github"
import { MarkdownContent } from "@/components/admin/markdown-content"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { AdminRepositorySlug } from "@/lib/admin-repositories"
import type { RepositoryDocumentVersion } from "@/lib/github-meetings"

type DocumentVersionsDialogProps = {
  repository: AdminRepositorySlug
  path: string
  currentSha: string
  versions: RepositoryDocumentVersion[]
  resolveImageSrc: (source: string | undefined) => string
  onRestore: (result: Awaited<ReturnType<typeof restoreRepositoryDocumentVersion>>) => Promise<void>
}

function formatVersionDate(value: string) {
  if (!value) return "Data desconhecida"

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function DocumentVersionsDialog({
  repository,
  path,
  currentSha,
  versions,
  resolveImageSrc,
  onRestore,
}: DocumentVersionsDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedSha, setSelectedSha] = useState(versions[0]?.sha ?? "")
  const [preview, setPreview] = useState<string | null>(null)
  const [loadingSha, setLoadingSha] = useState<string | null>(null)
  const [isRestoring, setIsRestoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selectedVersion = versions.find((version) => version.sha === selectedSha)
  const currentVersionSha = versions[0]?.sha ?? ""
  const isCurrentVersion = selectedSha === currentVersionSha

  useEffect(() => {
    if (!open || !selectedVersion) return

    let cancelled = false
    setLoadingSha(selectedVersion.sha)
    setError(null)

    void getRepositoryDocumentVersion(repository, path, selectedVersion.sha)
      .then((version) => {
        if (!cancelled) setPreview(version.content)
      })
      .catch((versionError: unknown) => {
        if (!cancelled) {
          setPreview(null)
          setError(versionError instanceof Error ? versionError.message : "Não foi possível carregar a versão.")
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSha(null)
      })

    return () => {
      cancelled = true
    }
  }, [open, path, repository, selectedSha, selectedVersion])

  async function restoreSelectedVersion() {
    if (!selectedVersion || isCurrentVersion || isRestoring) return

    setIsRestoring(true)
    setError(null)

    try {
      const result = await restoreRepositoryDocumentVersion(
        repository,
        path,
        currentSha,
        selectedVersion.sha,
      )
      await onRestore(result)
      setOpen(false)
    } catch (restoreError: unknown) {
      setError(restoreError instanceof Error ? restoreError.message : "Não foi possível restaurar a versão.")
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" disabled={versions.length === 0}>
          <History className="size-4" aria-hidden="true" />
          Versões
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[min(900px,calc(100vh-2rem))] max-h-[calc(100vh-2rem)] sm:!max-w-5xl overflow-hidden border-cyan-400/20 bg-slate-950 text-slate-100 grid-rows-[auto_minmax(0,1fr)_auto]">
        <DialogHeader>
          <DialogTitle>Histórico de versões</DialogTitle>
          <DialogDescription className="text-slate-400">
            Consulte versões anteriores deste arquivo e restaure uma delas se necessário.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 min-w-0 gap-4 overflow-hidden md:grid-cols-[18rem_minmax(0,1fr)]">
          <div className="min-h-0 min-w-0 space-y-2 overflow-y-auto pr-1">
            {versions.map((version, index) => {
              const isSelected = version.sha === selectedSha
              const isCurrent = index === 0 || version.sha === currentVersionSha

              return (
                <button
                  key={version.sha}
                  type="button"
                  onClick={() => setSelectedSha(version.sha)}
                  className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                    isSelected
                      ? "border-cyan-300/60 bg-cyan-300/10"
                      : "border-slate-800 bg-slate-900/70 hover:border-cyan-400/30"
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 text-sm font-medium text-slate-100">{version.message}</span>
                    {isCurrent ? <Check className="mt-0.5 size-4 shrink-0 text-cyan-300" aria-label="Versão atual" /> : null}
                  </span>
                  <span className="mt-2 block text-xs text-slate-400">{formatVersionDate(version.date)}</span>
                  <span className="mt-1 block font-mono text-[11px] text-slate-500">{version.sha.slice(0, 7)} · {version.author}</span>
                </button>
              )
            })}
          </div>

          <div className="min-h-0 min-w-0 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            {loadingSha ? (
              <div className="flex min-h-48 items-center justify-center text-sm text-slate-400">
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                Carregando versão…
              </div>
            ) : preview !== null ? (
              <MarkdownContent content={preview} resolveImageSrc={resolveImageSrc} />
            ) : (
              <div className="flex min-h-48 items-center justify-center text-sm text-slate-400">
                <Eye className="mr-2 size-4" aria-hidden="true" />
                Selecione uma versão para visualizar.
              </div>
            )}
          </div>
        </div>

        {error ? <p className="text-sm text-red-300" role="alert">{error}</p> : null}

        <DialogFooter>
          <Button
            type="button"
            disabled={!selectedVersion || isCurrentVersion || isRestoring}
            onClick={() => void restoreSelectedVersion()}
            className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"
          >
            {isRestoring ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <RotateCcw className="size-4" aria-hidden="true" />}
            {isRestoring ? "Restaurando…" : "Restaurar esta versão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
