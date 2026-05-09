"use client"

import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  getGeneratedMeetingPath,
  MEETING_CATEGORIES,
  normalizeMeetingFrontmatter,
  tagsToInput,
  type MeetingCategory,
  type MeetingEditorValues,
} from "@/lib/meeting-cms"

type MeetingEditorFormProps = {
  initialValues: MeetingEditorValues
  submitLabel: string
  fixedPath?: string
  pathPrefix?: string
  onCancel?: () => void
  onSubmit: (values: MeetingEditorValues) => Promise<void>
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Nao foi possivel salvar o documento."
}

export function MeetingEditorForm({
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const generatedFileName = getGeneratedMeetingPath(date, title)
  const previewPath =
    fixedPath ??
    [pathPrefix, generatedFileName]
      .flatMap((part) => part.split("/"))
      .filter(Boolean)
      .join("/")

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

      await onSubmit({
        ...frontmatter,
        content,
      })
    } catch (submitError) {
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

      <label className="mt-5 block">
        <span className="text-sm font-medium text-slate-200">Conteudo</span>
        <Textarea
          required
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="mt-2 min-h-[420px] border-cyan-400/20 bg-slate-950/70 font-mono text-sm text-white placeholder:text-slate-500"
          placeholder="# Pauta&#10;&#10;- Item discutido"
        />
      </label>

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
            onClick={onCancel}
            className="text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancelar
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"
        >
          {isSubmitting ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
