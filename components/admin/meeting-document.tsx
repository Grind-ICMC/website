"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Edit3, FileText, FolderTree, Trash2 } from "lucide-react"

import {
  deleteRepositoryDocument,
  updateRepositoryDocument,
} from "@/app/actions/github"
import { MeetingEditorForm } from "@/components/admin/meeting-editor-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  getAdminRepositoryConfig,
  getRepositoryFullName,
  type AdminRepositorySlug,
} from "@/lib/admin-repositories"
import {
  type MeetingEditorValues,
  type MeetingFrontmatterData,
} from "@/lib/meeting-cms"
import {
  getMeetingDocumentDirectory,
  getRepositoryImageSrc,
} from "@/lib/meeting-image-src"

type MeetingDocumentState = {
  path: string
  sha: string
  title: string
  frontmatter: MeetingFrontmatterData
  content: string
}

type MeetingDocumentProps = {
  repository: AdminRepositorySlug
  initialMeeting: MeetingDocumentState
  parentFolderHref: string
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Nao foi possivel concluir a operacao."
}

function capitalizeLabel(label: string) {
  return label.charAt(0).toLocaleUpperCase("pt-BR") + label.slice(1)
}

export function MeetingDocument({
  repository,
  initialMeeting,
  parentFolderHref,
}: MeetingDocumentProps) {
  const router = useRouter()
  const repositoryConfig = getAdminRepositoryConfig(repository)
  const [meeting, setMeeting] = useState(initialMeeting)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const documentDirectory = getMeetingDocumentDirectory(meeting.path)

  async function handleUpdate(values: MeetingEditorValues) {
    const { content, ...frontmatter } = values
    const result = await updateRepositoryDocument(
      repository,
      meeting.path,
      meeting.sha,
      frontmatter,
      content,
    )

    setMeeting({
      ...meeting,
      sha: result.sha,
      title: frontmatter.title,
      frontmatter,
      content,
    })
    setIsEditing(false)
    router.refresh()
  }

  async function handleDelete() {
    setDeleteError(null)
    setIsDeleting(true)

    try {
      await deleteRepositoryDocument(repository, meeting.path, meeting.sha)
      router.push(parentFolderHref)
      router.refresh()
    } catch (error) {
      setDeleteError(getErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <header className="mb-8 border-b border-cyan-400/15 pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-medium text-cyan-300">
              <FileText className="size-4" aria-hidden="true" />
              {capitalizeLabel(repositoryConfig.documentLabel)}
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              {meeting.title}
            </h1>
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
              <FolderTree className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{meeting.path}</span>
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => {
                setDeleteError(null)
                setIsEditing((current) => !current)
              }}
              className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"
            >
              <Edit3 className="size-4" aria-hidden="true" />
              {isEditing ? "Ver documento" : "Editar"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-400/30 bg-red-950/30 text-red-100 hover:bg-red-900/50 hover:text-white"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-red-400/25 bg-slate-950 text-slate-100">
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    Esta acao remove {meeting.path} do repositorio{" "}
                    {getRepositoryFullName(repositoryConfig)}. Ela cria um
                    commit de exclusao no GitHub.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    disabled={isDeleting}
                    className="border-cyan-400/20 bg-slate-900 text-slate-100 hover:bg-slate-800 hover:text-white"
                  >
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isDeleting}
                    onClick={(event) => {
                      event.preventDefault()
                      void handleDelete()
                    }}
                    className="bg-red-500 text-white hover:bg-red-400"
                  >
                    {isDeleting ? "Excluindo..." : "Confirmar exclusao"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {deleteError ? (
          <div className="mt-5 rounded-md border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {deleteError}
          </div>
        ) : null}
      </header>

      {isEditing ? (
        <MeetingEditorForm
          repository={repository}
          fixedPath={meeting.path}
          initialValues={{
            ...meeting.frontmatter,
            content: meeting.content,
          }}
          submitLabel="Salvar alterações"
          onCancel={() => setIsEditing(false)}
          onSubmit={handleUpdate}
        />
      ) : (
        <div className="rounded-lg border border-cyan-400/15 bg-slate-900/70 px-5 py-6 sm:px-8">
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
                    src={getRepositoryImageSrc(
                      repository,
                      documentDirectory,
                      typeof src === "string" ? src : "",
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
              {meeting.content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </>
  )
}
