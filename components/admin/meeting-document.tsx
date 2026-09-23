"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CalendarDays,
  Edit3,
  FileText,
  FolderTree,
  Save,
  Trash2,
  UserRound,
} from "lucide-react"

import {
  deleteRepositoryDocument,
  updateRepositoryDocument,
} from "@/app/actions/github"
import { MeetingEditorForm } from "@/components/admin/meeting-editor-form"
import { MarkdownContent } from "@/components/admin/markdown-content"
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
  formatDocumentDate,
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const documentDirectory = getMeetingDocumentDirectory(meeting.path)
  const editorFormId = "meeting-document-editor"

  useEffect(() => {
    document.documentElement.classList.toggle(
      "admin-document-editing",
      isEditing,
    )

    if (!isEditing) {
      return () =>
        document.documentElement.classList.remove("admin-document-editing")
    }

    function confirmLeaving(event: BeforeUnloadEvent) {
      if (!hasUnsavedChanges) return
      event.preventDefault()
      event.returnValue = ""
    }

    function confirmNavigation(event: MouseEvent) {
      if (!hasUnsavedChanges) return
      const target = event.target
      if (!(target instanceof Element)) return
      const link = target.closest("a[href]")
      if (!link || link.getAttribute("target") === "_blank") return
      if (
        !window.confirm(
          "Você tem alterações não salvas. Deseja sair e perdê-las?",
        )
      ) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    window.addEventListener("beforeunload", confirmLeaving)
    document.addEventListener("click", confirmNavigation, true)
    return () => {
      window.removeEventListener("beforeunload", confirmLeaving)
      document.removeEventListener("click", confirmNavigation, true)
      document.documentElement.classList.remove("admin-document-editing")
    }
  }, [hasUnsavedChanges, isEditing])

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
      path: result.path,
      sha: result.sha,
      title: frontmatter.title,
      frontmatter,
      content,
    })
    setIsEditing(false)
    setHasUnsavedChanges(false)
    if (result.path !== meeting.path) {
      router.replace(
        `/admin/${repository}/doc/${result.path.split("/").map(encodeURIComponent).join("/")}`,
      )
    }
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
      <header
        className={`mb-8 border-b border-cyan-400/15 pb-6 ${isEditing ? "sticky top-0 z-30 bg-background/95 pt-3 backdrop-blur-md" : ""}`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-medium text-cyan-300">
              <FileText className="size-4" aria-hidden="true" />
              {capitalizeLabel(repositoryConfig.documentLabel)}
            </p>
            {isEditing ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Editando documento
              </p>
            ) : (
              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                {meeting.title}
              </h1>
            )}
            {!isEditing && (
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
                  title={
                    meeting.frontmatter.date
                      ? "Data do documento"
                      : "Data não informada"
                  }
                >
                  <CalendarDays
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Data do documento: </span>
                  {formatDocumentDate(meeting.frontmatter.date)}
                </span>
                {meeting.frontmatter.author && (
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="size-4" aria-hidden="true" />
                    {meeting.frontmatter.author}
                  </span>
                )}
                {documentDirectory && (
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <FolderTree
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="truncate">{documentDirectory}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => {
                if (isEditing) {
                  const form = document.getElementById(editorFormId)
                  if (form instanceof HTMLFormElement) {
                    form.requestSubmit()
                  }
                } else {
                  setDeleteError(null)
                  setIsEditing(true)
                }
              }}
              className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"
            >
              {isEditing ? (
                <Save className="size-4" aria-hidden="true" />
              ) : (
                <Edit3 className="size-4" aria-hidden="true" />
              )}
              {isEditing ? "Salvar documento" : "Editar"}
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
                    Esta ação remove “{meeting.title}” do repositório{" "}
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
          compactHeader
          formId={editorFormId}
          onCancel={() => setIsEditing(false)}
          onDirtyChange={setHasUnsavedChanges}
          onSubmit={handleUpdate}
        />
      ) : (
        <div className="rounded-lg border border-cyan-400/15 bg-slate-900/70 px-5 py-6 sm:px-8">
          <MarkdownContent
            content={meeting.content}
            resolveImageSrc={(src) =>
              getRepositoryImageSrc(repository, documentDirectory, src ?? "")
            }
          />
        </div>
      )}
    </>
  )
}
