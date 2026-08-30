"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { FolderPlus } from "lucide-react"

import { createRepositoryFolder } from "@/app/actions/github"
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
import { Input } from "@/components/ui/input"
import {
  getAdminRepositoryConfig,
  type AdminRepositorySlug,
} from "@/lib/admin-repositories"

type CreateFolderDialogProps = {
  repository: AdminRepositorySlug
  currentPath: string
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Nao foi possivel criar a pasta."
}

export function CreateFolderDialog({
  repository,
  currentPath,
}: CreateFolderDialogProps) {
  const router = useRouter()
  const repositoryConfig = getAdminRepositoryConfig(repository)
  const [open, setOpen] = useState(false)
  const [folderName, setFolderName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await createRepositoryFolder(repository, currentPath, folderName)
      setFolderName("")
      setOpen(false)
      router.refresh()
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="border-border bg-card/70 text-foreground hover:bg-secondary hover:text-foreground"
        >
          <FolderPlus className="size-4" aria-hidden="true" />
          Nova Pasta
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>Nova pasta</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            A pasta sera criada no repositorio {repositoryConfig.repo} com um
            arquivo .gitkeep.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Nome</span>
            <Input
              required
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              className="mt-2 border-border bg-background/70 text-foreground placeholder:text-muted-foreground"
              placeholder="diretoria"
            />
          </label>

          {error ? (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
              {error}
            </div>
          ) : null}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "Criando..." : "Criar pasta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
