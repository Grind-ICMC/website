"use client"

import {
  ChangeEvent,
  ClipboardEvent,
  FormEvent,
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { Image as ImageIcon, FileText, Code2, Pencil } from "lucide-react"
import dynamic from "next/dynamic"
import { DocumentDateField } from "@/components/admin/document-date-field"
import { Switch } from "@/components/ui/switch"
import type { VisualDocumentEditorHandle } from "@/components/admin/visual-document-editor"

import { deleteRepositoryUploadedImage, uploadRepositoryImage } from "@/app/actions/github"
import { MarkdownContent } from "@/components/admin/markdown-content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AdminRepositorySlug } from "@/lib/admin-repositories"
import { normalizeMeetingFrontmatter, type MeetingEditorValues } from "@/lib/meeting-cms"
import { getRepositoryImageSrc } from "@/lib/meeting-image-src"

const VisualDocumentEditor = dynamic(
  () => import("@/components/admin/visual-document-editor").then((module) => module.VisualDocumentEditor),
  {
    ssr: false,
    loading: () => <div className="min-h-[640px] animate-pulse rounded-xl border border-border bg-card" />,
  },
)

const DOCUMENT_TITLE_MAX_LENGTH = 80

type MeetingEditorFormProps = {
  repository: AdminRepositorySlug
  initialValues: MeetingEditorValues
  submitLabel: string
  fixedPath?: string
  pathPrefix?: string
  onCancel?: () => void
  onSubmit: (values: MeetingEditorValues) => Promise<void>
  compactHeader?: boolean
  formId?: string
  onDirtyChange?: (dirty: boolean) => void
  compactActions?: ReactNode
}

type PendingImageUpload = {
  path: string
  sha: string
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Nao foi possivel salvar o documento."
}

function getParentPath(path: string) {
  return path.split("/").filter(Boolean).slice(0, -1).join("/")
}

function normalizePath(path: string) {
  return path.split("/").filter(Boolean).join("/")
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
        return
      }

      reject(new Error("Nao foi possivel ler a imagem selecionada."))
    }

    reader.onerror = () => reject(new Error("Nao foi possivel ler a imagem."))
    reader.readAsDataURL(file)
  })
}

function getImageExtension(file: File) {
  const mimeType = file.type.toLowerCase()

  if (mimeType === "image/jpeg") {
    return "jpg"
  }

  if (mimeType === "image/svg+xml") {
    return "svg"
  }

  const mimeExtension = mimeType.match(/^image\/([a-z0-9.+-]+)$/)?.[1]

  if (mimeExtension) {
    return mimeExtension.replace("+xml", "")
  }

  const fileExtension = file.name.match(/\.([a-z0-9]+)$/i)?.[1]

  return fileExtension ?? "png"
}

function getClipboardImageFileName(file: File) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")

  return `imagem-${timestamp}.${getImageExtension(file)}`
}

function getClipboardImage(event: ClipboardEvent<HTMLTextAreaElement>) {
  const itemImage = Array.from(event.clipboardData.items)
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .find((file): file is File => Boolean(file))

  if (itemImage) {
    return itemImage
  }

  return Array.from(event.clipboardData.files).find((file) => file.type.startsWith("image/"))
}

export function MeetingEditorForm({
  repository,
  initialValues,
  submitLabel,
  fixedPath,
  pathPrefix = "",
  onCancel,
  onSubmit,
  compactHeader = false,
  formId,
  onDirtyChange,
  compactActions,
}: MeetingEditorFormProps) {
  const [title, setTitle] = useState(initialValues.title)
  const [author, setAuthor] = useState(initialValues.author)
  const [date, setDate] = useState(initialValues.date)
  const [advanced, setAdvanced] = useState(false)
  const modeId = useId()
  const visualEditorRef = useRef<VisualDocumentEditorHandle>(null)
  const [content, setContent] = useState(initialValues.content)
  const [error, setError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isCleaningUploads, setIsCleaningUploads] = useState(false)
  const previewImageSources = useRef<Record<string, string>>({})
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectionRef = useRef({ start: 0, end: 0 })
  const pendingImageUploadsRef = useRef<PendingImageUpload[]>([])
  const uploadTasksRef = useRef<Promise<void>[]>([])
  const cleanupPromiseRef = useRef<Promise<void> | null>(null)
  const hasSavedRef = useRef(false)
  const isMountedRef = useRef(false)
  const uploadDirectory = normalizePath(fixedPath ? getParentPath(fixedPath) : pathPrefix)
  const hideAuthorField = repository === "psel-empresas"

  useEffect(() => {
    onDirtyChange?.(
      title !== initialValues.title ||
        date !== initialValues.date ||
        author !== initialValues.author ||
        content !== initialValues.content,
    )
  }, [author, content, date, initialValues, onDirtyChange, title])

  useLayoutEffect(() => {
    resizeMarkdownTextarea()
  }, [content, advanced])

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      void cleanupPendingUploads().catch(() => undefined)
    }
  }, [])

  function rememberSelection(element = textareaRef.current) {
    if (!element) {
      return
    }

    selectionRef.current = {
      start: element.selectionStart,
      end: element.selectionEnd,
    }
  }

  function resizeMarkdownTextarea() {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  async function cleanupPendingUploads(updateState = false) {
    if (hasSavedRef.current) {
      return
    }

    if (cleanupPromiseRef.current) {
      return cleanupPromiseRef.current
    }

    if (updateState && isMountedRef.current) {
      setIsCleaningUploads(true)
    }

    const cleanupPromise = (async () => {
      await Promise.allSettled(uploadTasksRef.current)

      const uploads = pendingImageUploadsRef.current

      if (!uploads.length) {
        return
      }

      const failedUploads: PendingImageUpload[] = []

      pendingImageUploadsRef.current = []

      await Promise.all(
        uploads.map(async (upload) => {
          try {
            await deleteRepositoryUploadedImage(repository, uploadDirectory, upload.path, upload.sha)
          } catch {
            failedUploads.push(upload)
          }
        }),
      )

      if (failedUploads.length) {
        pendingImageUploadsRef.current = [...failedUploads, ...pendingImageUploadsRef.current]
        throw new Error("Nao foi possivel remover todas as imagens pendentes.")
      }
    })()

    cleanupPromiseRef.current = cleanupPromise

    try {
      await cleanupPromise
    } finally {
      cleanupPromiseRef.current = null

      if (updateState && isMountedRef.current) {
        setIsCleaningUploads(false)
      }
    }
  }

  function insertAtSelection(markdown: string, selection = selectionRef.current) {
    const currentContent = textareaRef.current?.value ?? content
    const start = Math.min(selection.start, currentContent.length)
    const end = Math.min(selection.end, currentContent.length)
    const nextContent = `${currentContent.slice(0, start)}${markdown}${currentContent.slice(end)}`
    const nextPosition = start + markdown.length

    setContent(nextContent)

    requestAnimationFrame(() => {
      const textarea = textareaRef.current

      if (!textarea) {
        return
      }

      textarea.focus()
      textarea.setSelectionRange(nextPosition, nextPosition)
      selectionRef.current = {
        start: nextPosition,
        end: nextPosition,
      }
    })
  }

  function resolvePreviewImageSrc(source: string | undefined) {
    if (!source) {
      return ""
    }

    if (previewImageSources.current[source]) {
      return previewImageSources.current[source]
    }

    return getRepositoryImageSrc(repository, uploadDirectory, source)
  }

  async function uploadAndInsertImage(file: File, fileName: string) {
    const selection = { ...selectionRef.current }

    setUploadError(null)
    setIsUploadingImage(true)

    const uploadTask = (async () => {
      const dataUrl = await readFileAsDataUrl(file)
      const result = await uploadRepositoryImage(repository, uploadDirectory, fileName, dataUrl)
      const imageMarkdown = `![Image](${result.path})`

      pendingImageUploadsRef.current = [
        ...pendingImageUploadsRef.current,
        {
          path: result.path,
          sha: result.sha,
        },
      ]

      if (!isMountedRef.current || hasSavedRef.current) {
        return
      }

      previewImageSources.current[result.path] = dataUrl
      if (advanced) insertAtSelection(imageMarkdown, selection)
      else visualEditorRef.current?.insertImage(result.path, file.name)
    })()

    uploadTasksRef.current = [...uploadTasksRef.current, uploadTask.catch(() => undefined)]

    try {
      await uploadTask
    } catch (uploadError) {
      if (isMountedRef.current) {
        setUploadError(getErrorMessage(uploadError))
      }
    } finally {
      if (isMountedRef.current) {
        setIsUploadingImage(false)
      }
    }
  }

  async function handleUploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      await uploadAndInsertImage(file, file.name)
    } finally {
      event.target.value = ""
    }
  }

  async function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const image = getClipboardImage(event)

    if (!image) {
      return
    }

    event.preventDefault()
    rememberSelection(event.currentTarget)

    if (isUploadingImage) {
      setUploadError("Aguarde o envio da imagem atual terminar.")
      return
    }

    await uploadAndInsertImage(image, getClipboardImageFileName(image))
  }

  async function handleCancel() {
    if (!onCancel) {
      return
    }

    setUploadError(null)

    try {
      await cleanupPendingUploads(true)
      onCancel()
    } catch (cleanupError) {
      setUploadError(getErrorMessage(cleanupError))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const frontmatter = normalizeMeetingFrontmatter(
        {
          title,
          author: hideAuthorField ? "" : author,
          date,
        },
        {
          requireAuthor: !hideAuthorField,
          requireDate: !fixedPath,
        },
      )

      if (!content.trim()) {
        throw new Error("Informe o conteúdo do documento.")
      }

      if (isUploadingImage) {
        throw new Error("Aguarde o envio da imagem terminar antes de salvar.")
      }

      hasSavedRef.current = true

      await onSubmit({
        ...frontmatter,
        content,
      })

      pendingImageUploadsRef.current = []
    } catch (submitError) {
      hasSavedRef.current = false
      setError(getErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const busy = isSubmitting || isUploadingImage || isCleaningUploads

  function chooseImage() {
    if (advanced) rememberSelection()
    else visualEditorRef.current?.rememberSelection()
    fileInputRef.current?.click()
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="min-w-0 space-y-6">
      {compactHeader ? (
        <div className="document-editor-meta-bar flex min-w-0 flex-wrap items-center gap-2 border-b border-border bg-background/95 p-2 shadow-lg backdrop-blur-md sm:p-3">
          <label className="relative block min-w-0 flex-1 basis-52">
            <span className="sr-only">Título do documento</span>
            <Pencil className="pointer-events-none absolute mt-3 ml-3 size-4 text-primary" aria-hidden="true" />
            <Input
              required
              maxLength={DOCUMENT_TITLE_MAX_LENGTH}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={busy}
              className="h-10 border-border bg-card pl-9 text-base font-semibold placeholder:text-muted-foreground"
              placeholder="Título do documento"
            />
          </label>
          <div className="w-44 shrink-0">
            <DocumentDateField value={date} onChange={setDate} disabled={busy} hideLabel />
          </div>
          {compactActions ? <div className="flex shrink-0 items-center gap-2">{compactActions}</div> : null}
        </div>
      ) : (
        <fieldset
          disabled={busy}
          className="grid min-w-0 gap-5 rounded-xl border border-border bg-card/80 p-5 disabled:opacity-60 sm:p-6 md:grid-cols-2"
        >
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-foreground">Título</span>
            <Input
              required
              maxLength={DOCUMENT_TITLE_MAX_LENGTH}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 h-12 border-border bg-background/60 text-lg font-medium placeholder:text-muted-foreground"
              placeholder="Dê um título ao documento"
            />
          </label>
          {!hideAuthorField && (
            <label className="block">
              <span className="text-sm font-medium text-foreground">Autor</span>
              <Input
                required
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                className="mt-2 h-11 border-border bg-background/60"
                placeholder="Nome do autor"
              />
            </label>
          )}
          <DocumentDateField value={date} onChange={setDate} disabled={busy} />
        </fieldset>
      )}

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            {advanced ? <Code2 className="size-4 text-primary" /> : <FileText className="size-4 text-primary" />}
            {advanced ? "Editar Markdown" : "Seu documento"}
          </div>
          <label
            htmlFor={modeId}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground"
          >
            Markdown avançado
            <Switch id={modeId} checked={advanced} onCheckedChange={setAdvanced} disabled={busy} />
          </label>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
        {isUploadingImage && (
          <p role="status" className="mb-3 text-sm text-primary">
            Enviando imagem…
          </p>
        )}
        {uploadError && (
          <div
            role="alert"
            className="mb-3 rounded-md border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100"
          >
            {uploadError}
          </div>
        )}
        {advanced ? (
          <>
            <div className="mb-3 flex justify-end">
              <Button type="button" size="sm" variant="outline" disabled={busy} onClick={chooseImage}>
                <ImageIcon className="size-4" aria-hidden="true" />
                Inserir imagem
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="overflow-hidden rounded-lg border border-border bg-card/70">
                <div className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-primary">
                  Markdown
                </div>
                <textarea
                  ref={textareaRef}
                  required
                  disabled={busy}
                  aria-label="Conteúdo em Markdown"
                  value={content}
                  onBlur={(event) => rememberSelection(event.currentTarget)}
                  onChange={(event) => {
                    setContent(event.target.value)
                    rememberSelection(event.currentTarget)
                  }}
                  onClick={(event) => rememberSelection(event.currentTarget)}
                  onKeyUp={(event) => rememberSelection(event.currentTarget)}
                  onPaste={handlePaste}
                  onSelect={(event) => rememberSelection(event.currentTarget)}
                  className="min-h-[520px] w-full resize-none overflow-hidden border-0 bg-transparent px-4 py-3 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-0"
                  placeholder="# Pauta&#10;&#10;- Item discutido"
                />
              </div>
              <div className="min-w-0 rounded-lg border border-border bg-card/70">
                <div className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-primary">
                  Pré-visualização
                </div>
                <div className="min-h-[520px] px-4 py-3">
                  {content.trim() ? (
                    <MarkdownContent content={content} resolveImageSrc={resolvePreviewImageSrc} />
                  ) : (
                    <div className="flex min-h-[496px] items-center justify-center text-sm text-muted-foreground">
                      A pré-visualização aparecerá aqui.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <VisualDocumentEditor
            editorRef={visualEditorRef}
            content={content}
            onChange={setContent}
            resolveImageSrc={resolvePreviewImageSrc}
            onUploadImage={chooseImage}
            onPasteImage={(file) => {
              if (!busy) void uploadAndInsertImage(file, getClipboardImageFileName(file))
            }}
            disabled={busy}
            compactHeader={compactHeader}
          />
        )}
      </div>
      {error && (
        <div role="alert" className="rounded-md border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}
      {!compactHeader && (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button type="button" variant="ghost" disabled={busy} onClick={handleCancel}>
              {isCleaningUploads ? "Cancelando…" : "Cancelar"}
            </Button>
          )}
          <Button type="submit" disabled={busy}>
            {isSubmitting ? "Salvando…" : isUploadingImage ? "Enviando imagem…" : submitLabel}
          </Button>
        </div>
      )}
    </form>
  )
}
