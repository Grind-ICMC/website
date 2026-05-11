"use client"

import {
  ChangeEvent,
  ClipboardEvent,
  FormEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Image as ImageIcon } from "lucide-react"

import {
  deleteRepositoryUploadedImage,
  uploadRepositoryImage,
} from "@/app/actions/github"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AdminRepositorySlug } from "@/lib/admin-repositories"
import {
  getGeneratedMeetingPath,
  MEETING_CATEGORIES,
  normalizeMeetingFrontmatter,
  tagsToInput,
  type MeetingCategory,
  type MeetingEditorValues,
} from "@/lib/meeting-cms"
import { getRepositoryImageSrc } from "@/lib/meeting-image-src"

type MeetingEditorFormProps = {
  repository: AdminRepositorySlug
  initialValues: MeetingEditorValues
  submitLabel: string
  fixedPath?: string
  pathPrefix?: string
  onCancel?: () => void
  onSubmit: (values: MeetingEditorValues) => Promise<void>
}

type PendingImageUpload = {
  path: string
  sha: string
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Nao foi possivel salvar o documento."
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

  return Array.from(event.clipboardData.files).find((file) =>
    file.type.startsWith("image/"),
  )
}

export function MeetingEditorForm({
  repository,
  initialValues,
  submitLabel,
  fixedPath,
  pathPrefix = "",
  onCancel,
  onSubmit,
}: MeetingEditorFormProps) {
  const [title, setTitle] = useState(initialValues.title)
  const [author, setAuthor] = useState(initialValues.author)
  const [date, setDate] = useState(initialValues.date)
  const [category, setCategory] = useState<MeetingCategory>(
    initialValues.category,
  )
  const [tags, setTags] = useState(tagsToInput(initialValues.tags))
  const [content, setContent] = useState(initialValues.content)
  const [error, setError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isCleaningUploads, setIsCleaningUploads] = useState(false)
  const [previewImageSources, setPreviewImageSources] = useState<
    Record<string, string>
  >({})
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectionRef = useRef({ start: 0, end: 0 })
  const pendingImageUploadsRef = useRef<PendingImageUpload[]>([])
  const uploadTasksRef = useRef<Promise<void>[]>([])
  const cleanupPromiseRef = useRef<Promise<void> | null>(null)
  const hasSavedRef = useRef(false)
  const isMountedRef = useRef(false)
  const generatedFileName = getGeneratedMeetingPath(date, title)
  const previewPath =
    fixedPath ??
    [pathPrefix, generatedFileName]
      .flatMap((part) => part.split("/"))
      .filter(Boolean)
      .join("/")
  const uploadDirectory = normalizePath(
    fixedPath ? getParentPath(fixedPath) : pathPrefix,
  )

  useLayoutEffect(() => {
    resizeMarkdownTextarea()
  }, [content])

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
            await deleteRepositoryUploadedImage(
              repository,
              uploadDirectory,
              upload.path,
              upload.sha,
            )
          } catch {
            failedUploads.push(upload)
          }
        }),
      )

      if (failedUploads.length) {
        pendingImageUploadsRef.current = [
          ...failedUploads,
          ...pendingImageUploadsRef.current,
        ]
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

  function insertAtSelection(
    markdown: string,
    selection = selectionRef.current,
  ) {
    const currentContent = textareaRef.current?.value ?? content
    const start = Math.min(selection.start, currentContent.length)
    const end = Math.min(selection.end, currentContent.length)
    const nextContent = `${currentContent.slice(
      0,
      start,
    )}${markdown}${currentContent.slice(end)}`
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

    if (previewImageSources[source]) {
      return previewImageSources[source]
    }

    return getRepositoryImageSrc(repository, uploadDirectory, source)
  }

  async function uploadAndInsertImage(file: File, fileName: string) {
    const selection = { ...selectionRef.current }

    setUploadError(null)
    setIsUploadingImage(true)

    const uploadTask = (async () => {
      const dataUrl = await readFileAsDataUrl(file)
      const result = await uploadRepositoryImage(
        repository,
        uploadDirectory,
        fileName,
        dataUrl,
      )
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

      setPreviewImageSources((current) => ({
        ...current,
        [result.path]: dataUrl,
      }))
      insertAtSelection(imageMarkdown, selection)
    })()

    uploadTasksRef.current = [
      ...uploadTasksRef.current,
      uploadTask.catch(() => undefined),
    ]

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
      const frontmatter = normalizeMeetingFrontmatter({
        title,
        author,
        date,
        category,
        tags,
      })

      if (!content.trim()) {
        throw new Error("Informe o conteudo Markdown do documento.")
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

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-cyan-400/15 bg-slate-900/70 p-5 sm:p-6"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-200">Titulo</span>
          <Input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 border-cyan-400/20 bg-slate-950/70 text-white placeholder:text-slate-500"
            placeholder="Ata da reuniao semanal"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">Autor</span>
          <Input
            required
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            className="mt-2 border-cyan-400/20 bg-slate-950/70 text-white placeholder:text-slate-500"
            placeholder="Nome do autor"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">Data</span>
          <Input
            required
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 border-cyan-400/20 bg-slate-950/70 text-white"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">Categoria</span>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as MeetingCategory)
            }
            className="mt-2 h-9 w-full rounded-md border border-cyan-400/20 bg-slate-950/70 px-3 py-1 text-sm text-white shadow-xs outline-none transition focus-visible:border-cyan-300 focus-visible:ring-3 focus-visible:ring-cyan-300/20"
          >
            {MEETING_CATEGORIES.map((meetingCategory) => (
              <option key={meetingCategory} value={meetingCategory}>
                {meetingCategory}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-200">Tags</span>
          <Input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            className="mt-2 border-cyan-400/20 bg-slate-950/70 text-white placeholder:text-slate-500"
            placeholder="planejamento, diretoria, entrevistas"
          />
        </label>
      </div>

      <div className="mt-5 rounded-md border border-cyan-400/10 bg-slate-950/70 px-3 py-2 font-mono text-xs text-slate-400">
        {previewPath}
      </div>

      <div className="mt-5">
        <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium text-slate-200">Conteudo</span>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadImage}
            />
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting || isUploadingImage || isCleaningUploads}
              onClick={() => {
                rememberSelection()
                fileInputRef.current?.click()
              }}
              className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"
            >
              <ImageIcon className="size-4" aria-hidden="true" />
              {isUploadingImage ? "Enviando..." : "Upload Image"}
            </Button>
          </div>
        </div>

        {uploadError ? (
          <div className="mb-3 rounded-md border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {uploadError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-cyan-400/15 bg-slate-950/70">
            <div className="border-b border-cyan-400/10 px-4 py-3 text-xs font-semibold uppercase text-cyan-300">
              Editar Markdown
            </div>
            <textarea
              ref={textareaRef}
              required
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
              className="min-h-[520px] w-full resize-none overflow-hidden border-0 bg-transparent px-4 py-3 font-mono text-sm text-white outline-none placeholder:text-slate-500 focus:ring-0"
              placeholder="# Pauta&#10;&#10;- Item discutido"
            />
          </div>

          <div className="rounded-lg border border-cyan-400/15 bg-slate-950/70">
            <div className="border-b border-cyan-400/10 px-4 py-3 text-xs font-semibold uppercase text-cyan-300">
              Preview
            </div>
            <div className="min-h-[520px] px-4 py-3">
              {content.trim() ? (
                <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-cyan-300 prose-a:no-underline hover:prose-a:text-cyan-100 prose-code:text-cyan-100 prose-img:rounded-md prose-img:border prose-img:border-cyan-400/15 prose-pre:border prose-pre:border-cyan-400/15 prose-pre:bg-slate-950 prose-strong:text-white">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node: _node, ...props }) => (
                        <a {...props} target="_blank" rel="noreferrer" />
                      ),
                      img: ({ node: _node, src, alt, ...props }) => (
                        <img
                          {...props}
                          src={resolvePreviewImageSrc(
                            typeof src === "string" ? src : undefined,
                          )}
                          alt={alt ?? ""}
                        />
                      ),
                      table: ({ node: _node, ...props }) => (
                        <div className="my-4 overflow-x-auto rounded-md border border-cyan-400/15">
                          <table
                            {...props}
                            className="my-0 w-full border-collapse text-left text-sm"
                          />
                        </div>
                      ),
                      thead: ({ node: _node, ...props }) => (
                        <thead
                          {...props}
                          className="bg-slate-900/80 text-cyan-200"
                        />
                      ),
                      th: ({ node: _node, ...props }) => (
                        <th
                          {...props}
                          className="border-b border-cyan-400/15 px-4 py-2 font-semibold"
                        />
                      ),
                      td: ({ node: _node, ...props }) => (
                        <td
                          {...props}
                          className="border-b border-cyan-400/10 px-4 py-2 align-top text-slate-200"
                        />
                      ),
                      tr: ({ node: _node, ...props }) => (
                        <tr {...props} className="hover:bg-slate-900/40" />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex min-h-[496px] items-center justify-center rounded-md border border-dashed border-cyan-400/15 text-sm text-slate-500">
                  A pré-visualização aparecerá aqui.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-md border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting || isUploadingImage || isCleaningUploads}
            onClick={handleCancel}
            className="text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {isCleaningUploads ? "Cancelando..." : "Cancelar"}
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={isSubmitting || isUploadingImage || isCleaningUploads}
          className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"
        >
          {isSubmitting
            ? "Salvando..."
            : isUploadingImage
              ? "Enviando imagem..."
              : submitLabel}
        </Button>
      </div>
    </form>
  )
}
