"use client"

import { useRouter } from "next/navigation"

import { createRepositoryDocument } from "@/app/actions/github"
import { MeetingEditorForm } from "@/components/admin/meeting-editor-form"
import {
  getAdminRepositoryConfig,
  type AdminRepositorySlug,
} from "@/lib/admin-repositories"
import {
  getGeneratedMeetingPath,
  getTodayInputDate,
  type MeetingEditorValues,
} from "@/lib/meeting-cms"

type MeetingCreateFormProps = {
  repository: AdminRepositorySlug
  defaultAuthor: string
  currentPath: string
  currentFolderHref: string
}

export function MeetingCreateForm({
  repository,
  defaultAuthor,
  currentPath,
  currentFolderHref,
}: MeetingCreateFormProps) {
  const router = useRouter()
  const repositoryConfig = getAdminRepositoryConfig(repository)

  async function handleSubmit(values: MeetingEditorValues) {
    const { content, ...frontmatter } = values
    const fileName = getGeneratedMeetingPath(frontmatter.date, frontmatter.title)
    const path = [currentPath, fileName]
      .flatMap((part) => part.split("/"))
      .filter(Boolean)
      .join("/")

    await createRepositoryDocument(repository, path, frontmatter, content)
    router.push(currentFolderHref)
    router.refresh()
  }

  return (
    <MeetingEditorForm
      repository={repository}
      initialValues={{
        title: "",
        author: defaultAuthor,
        date: getTodayInputDate(),
        category: "Geral",
        tags: [],
        content: "",
      }}
      submitLabel={repositoryConfig.createSubmitLabel}
      pathPrefix={currentPath}
      onSubmit={handleSubmit}
    />
  )
}
