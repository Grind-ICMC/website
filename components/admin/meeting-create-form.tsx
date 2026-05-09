"use client"

import { useRouter } from "next/navigation"

import { createMeeting } from "@/app/actions/github"
import { MeetingEditorForm } from "@/components/admin/meeting-editor-form"
import {
  getGeneratedMeetingPath,
  getTodayInputDate,
  type MeetingEditorValues,
} from "@/lib/meeting-cms"

type MeetingCreateFormProps = {
  defaultAuthor: string
  currentPath: string
  currentFolderHref: string
}

export function MeetingCreateForm({
  defaultAuthor,
  currentPath,
  currentFolderHref,
}: MeetingCreateFormProps) {
  const router = useRouter()

  async function handleSubmit(values: MeetingEditorValues) {
    const { content, ...frontmatter } = values
    const fileName = getGeneratedMeetingPath(frontmatter.date, frontmatter.title)
    const path = [currentPath, fileName]
      .flatMap((part) => part.split("/"))
      .filter(Boolean)
      .join("/")

    await createMeeting(path, frontmatter, content)
    router.push(currentFolderHref)
    router.refresh()
  }

  return (
    <MeetingEditorForm
      initialValues={{
        title: "",
        author: defaultAuthor,
        date: getTodayInputDate(),
        category: "Geral",
        tags: [],
        content: "",
      }}
      submitLabel="Criar documento"
      pathPrefix={currentPath}
      onSubmit={handleSubmit}
    />
  )
}
