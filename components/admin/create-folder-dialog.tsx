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
          className="border-cyan-400/20 bg-slate-900/70 text-cyan-100 hover:bg-cyan-300/10 hover:text-white"
        >
          <FolderPlus className="size-4" aria-hidden="true" />
          Nova Pasta
        </Button>
      </DialogTrigger>
      <DialogContent className="border-cyan-400/20 bg-slate-950 text-slate-100">
        <DialogHeader>
          <DialogTitle>Nova pasta</DialogTitle>
          <DialogDescription className="text-slate-400">
            A pasta sera criada no repositorio {repositoryConfig.repo} com um
            arquivo .gitkeep.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-200">Nome</span>
            <Input
              required
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              className="mt-2 border-cyan-400/20 bg-slate-950/70 text-white placeholder:text-slate-500"
              placeholder="diretoria"
            />
          </label>

          {error ? (
            <div className="mt-4 rounded-md border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => setOpen(false)}
              className="text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"
            >
              {isSubmitting ? "Criando..." : "Criar pasta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
