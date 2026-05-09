"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { Edit3, FileText, FolderTree, Trash2 } from "lucide-react"

import { deleteMeeting, updateMeeting } from "@/app/actions/github"
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
  type MeetingEditorValues,
  type MeetingFrontmatterData,
} from "@/lib/meeting-cms"

type MeetingDocumentState = {
  path: string
  sha: string
  title: string
  frontmatter: MeetingFrontmatterData
  content: string
}

type MeetingDocumentProps = {
  initialMeeting: MeetingDocumentState
  parentFolderHref: string
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Nao foi possivel concluir a operacao."
}

export function MeetingDocument({
  initialMeeting,
  parentFolderHref,
}: MeetingDocumentProps) {
  const router = useRouter()
  const [meeting, setMeeting] = useState(initialMeeting)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleUpdate(values: MeetingEditorValues) {
    const { content, ...frontmatter } = values
    const result = await updateMeeting(
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
      await deleteMeeting(meeting.path, meeting.sha)
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
              Ata da reunião
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
                    Esta acao remove {meeting.path} do repositorio
                    Grind-ICMC/meetings. Ela cria um commit de exclusao no
                    GitHub.
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
          <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-cyan-300 prose-a:no-underline hover:prose-a:text-cyan-100 prose-code:text-cyan-100 prose-pre:border prose-pre:border-cyan-400/15 prose-pre:bg-slate-950 prose-strong:text-white">
            <ReactMarkdown
              components={{
                a: ({ node: _node, ...props }) => (
                  <a {...props} target="_blank" rel="noreferrer" />
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
