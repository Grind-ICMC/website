"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

import { deleteRepositoryFolder } from "@/app/actions/github"
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

type DeleteFolderDialogProps = {
  repository: AdminRepositorySlug
  folderPath: string
  parentFolderHref: string
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Nao foi possivel excluir a pasta."
}

export function DeleteFolderDialog({
  repository,
  folderPath,
  parentFolderHref,
}: DeleteFolderDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsDeleting(true)

    try {
      await deleteRepositoryFolder(repository, folderPath)
      setOpen(false)
      router.push(parentFolderHref)
      router.refresh()
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeleting) {
          setOpen(nextOpen)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="border-red-400/30 bg-red-950/30 text-red-100 hover:bg-red-900/50 hover:text-white"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Excluir Pasta
        </Button>
      </DialogTrigger>
      <DialogContent className="border-red-400/25 bg-slate-950 text-slate-100">
        <DialogHeader>
          <DialogTitle>Excluir pasta?</DialogTitle>
          <DialogDescription className="text-slate-400">
            Tem certeza que deseja excluir esta pasta? Todos os documentos e
            subpastas dentro dela serão apagados permanentemente. Esta ação não
            pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-red-400/20 bg-red-950/20 px-3 py-2 font-mono text-xs text-red-100/80">
          {folderPath}
        </div>

        <form onSubmit={handleSubmit}>
          {error ? (
            <div className="mb-4 rounded-md border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={isDeleting}
              onClick={() => setOpen(false)}
              className="text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
