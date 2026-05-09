"use server"

import matter from "gray-matter"
import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import {
  assertValidDirectoryPath,
  assertValidFolderName,
  assertValidMarkdownPath,
  encodeGitHubPath,
  getGitHubHeaders,
  getMeetingFolderHref,
  getMeetingHref,
  getParentPath,
} from "@/lib/github-meetings"
import {
  normalizeMeetingFrontmatter,
  type MeetingFrontmatterData,
} from "@/lib/meeting-cms"

const OWNER = "Grind-ICMC"
const REPO = "meetings"
const CONTENTS_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents`

type GitHubWriteResponse = {
  content?: {
    path?: string
    sha?: string
  }
}

async function requireSession() {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Voce precisa estar autenticado para alterar documentos.")
  }
}

function getActionHeaders() {
  return {
    ...getGitHubHeaders(),
    "Content-Type": "application/json",
  }
}

function serializeMeetingContent(
  frontmatterData: MeetingFrontmatterData,
  markdownContent: string,
) {
  const frontmatter = normalizeMeetingFrontmatter(frontmatterData)

  if (!markdownContent.trim()) {
    throw new Error("Informe o conteudo Markdown do documento.")
  }

  const document = matter.stringify(
    `${markdownContent.trimEnd()}\n`,
    frontmatter,
  )
  return Buffer.from(document, "utf8").toString("base64")
}

function assertValidSha(sha: string) {
  if (!sha.trim()) {
    throw new Error("SHA do arquivo nao informado.")
  }
}

async function getGitHubErrorMessage(response: Response) {
  const body = (await response.json().catch(() => null)) as unknown

  if (
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message
  }

  return `GitHub API request failed with status ${response.status}`
}

async function assertGitHubResponse(response: Response) {
  if (response.ok) {
    return
  }

  const message = await getGitHubErrorMessage(response)

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      `Token do GitHub sem permissao para alterar o repositorio: ${message}`,
    )
  }

  if (response.status === 404) {
    throw new Error(`Arquivo ou repositorio nao encontrado: ${message}`)
  }

  if (response.status === 409) {
    throw new Error(
      `Conflito ao salvar no GitHub. Recarregue o documento e tente novamente: ${message}`,
    )
  }

  if (response.status === 422) {
    throw new Error(`Dados rejeitados pelo GitHub: ${message}`)
  }

  throw new Error(message)
}

function joinGitHubPath(...parts: string[]) {
  return parts
    .flatMap((part) => part.split("/"))
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/")
}

function revalidateMeeting(path: string) {
  const parentPath = getParentPath(path)

  revalidatePath("/admin/meetings")
  revalidatePath(getMeetingHref(path))
  revalidatePath(getMeetingFolderHref(parentPath))
}

function revalidateFolder(path: string) {
  revalidatePath("/admin/meetings")
  revalidatePath(getMeetingFolderHref(path))
}

export async function createMeeting(
  path: string,
  frontmatterData: MeetingFrontmatterData,
  markdownContent: string,
) {
  await requireSession()
  assertValidMarkdownPath(path)

  const response = await fetch(`${CONTENTS_URL}/${encodeGitHubPath(path)}`, {
    method: "PUT",
    headers: getActionHeaders(),
    body: JSON.stringify({
      message: `Create meeting: ${path}`,
      content: serializeMeetingContent(frontmatterData, markdownContent),
    }),
  })

  await assertGitHubResponse(response)

  const result = (await response.json()) as GitHubWriteResponse
  const sha = result.content?.sha

  if (!sha) {
    throw new Error("O GitHub nao retornou o novo SHA do arquivo.")
  }

  revalidateMeeting(path)

  return {
    path: result.content?.path ?? path,
    sha,
  }
}

export async function updateMeeting(
  path: string,
  sha: string,
  frontmatterData: MeetingFrontmatterData,
  markdownContent: string,
) {
  await requireSession()
  assertValidMarkdownPath(path)
  assertValidSha(sha)

  const response = await fetch(`${CONTENTS_URL}/${encodeGitHubPath(path)}`, {
    method: "PUT",
    headers: getActionHeaders(),
    body: JSON.stringify({
      message: `Update meeting: ${path}`,
      content: serializeMeetingContent(frontmatterData, markdownContent),
      sha,
    }),
  })

  await assertGitHubResponse(response)

  const result = (await response.json()) as GitHubWriteResponse
  const nextSha = result.content?.sha

  if (!nextSha) {
    throw new Error("O GitHub nao retornou o novo SHA do arquivo.")
  }

  revalidateMeeting(path)

  return {
    path: result.content?.path ?? path,
    sha: nextSha,
  }
}

export async function deleteMeeting(path: string, sha: string) {
  await requireSession()
  assertValidMarkdownPath(path)
  assertValidSha(sha)

  const response = await fetch(`${CONTENTS_URL}/${encodeGitHubPath(path)}`, {
    method: "DELETE",
    headers: getActionHeaders(),
    body: JSON.stringify({
      message: `Delete meeting: ${path}`,
      sha,
    }),
  })

  await assertGitHubResponse(response)
  revalidateMeeting(path)

  return {
    path,
  }
}

export async function createFolder(currentPath: string, folderName: string) {
  await requireSession()
  assertValidDirectoryPath(currentPath)

  const name = assertValidFolderName(folderName)
  const folderPath = joinGitHubPath(currentPath, name)
  const keepFilePath = joinGitHubPath(folderPath, ".gitkeep")

  const response = await fetch(
    `${CONTENTS_URL}/${encodeGitHubPath(keepFilePath)}`,
    {
      method: "PUT",
      headers: getActionHeaders(),
      body: JSON.stringify({
        message: `Create folder: ${folderPath}`,
        content: Buffer.from("Keep directory", "utf8").toString("base64"),
      }),
    },
  )

  await assertGitHubResponse(response)
  revalidateFolder(currentPath)

  return {
    path: folderPath,
  }
}
