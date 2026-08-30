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
          className="border-destructive/30 bg-destructive/10 text-destructive-foreground hover:bg-destructive/20 hover:text-destructive-foreground"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Excluir Pasta
        </Button>
      </DialogTrigger>
      <DialogContent className="border-destructive/30 bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>Excluir pasta?</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tem certeza que deseja excluir esta pasta? Todos os documentos e
            subpastas dentro dela serão apagados permanentemente. Esta ação não
            pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive-foreground/80">
          {folderPath}
        </div>

        <form onSubmit={handleSubmit}>
          {error ? (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
              {error}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={isDeleting}
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
