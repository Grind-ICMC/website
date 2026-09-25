"use client"

import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { ImagePlus, LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import { uploadRepositoryFolderIcon } from "@/app/actions/github"
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
import type { AdminRepositorySlug } from "@/lib/admin-repositories"

type FolderIconDialogProps = {
  repository: AdminRepositorySlug
  folderPath: string
  hasIcon?: boolean
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result)
      else reject(new Error("Não foi possível ler a imagem selecionada."))
    }
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."))
    reader.readAsDataURL(file)
  })
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Não foi possível salvar o ícone."
}

export function FolderIconDialog({
  repository,
  folderPath,
  hasIcon = false,
}: FolderIconDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    setError(null)
    setFile(selected)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) {
      setError("Escolha uma imagem para continuar.")
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      await uploadRepositoryFolderIcon(repository, folderPath, file.name, dataUrl)
      setFile(null)
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
          variant="ghost"
          size="icon-sm"
          title={hasIcon ? "Alterar ícone da pasta" : "Adicionar ícone à pasta"}
          aria-label={hasIcon ? "Alterar ícone da pasta" : "Adicionar ícone à pasta"}
          className="shrink-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
        >
          <ImagePlus className="size-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>{hasIcon ? "Alterar ícone da pasta" : "Adicionar ícone à pasta"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            A imagem será salva automaticamente em <code>imgs/folder-icon</code> dentro da pasta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Imagem</span>
            <Input
              required
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              onChange={handleFileChange}
              className="mt-2 border-border bg-background/70 text-foreground file:text-foreground"
            />
          </label>

          {preview ? (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3">
              <img src={preview} alt="Pré-visualização do ícone" className="size-14 rounded-xl object-cover" />
              <p className="min-w-0 truncate text-sm text-muted-foreground">{file?.name}</p>
            </div>
          ) : null}

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
            <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isSubmitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
              {isSubmitting ? "Salvando..." : "Salvar ícone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
