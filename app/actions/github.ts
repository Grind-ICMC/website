"use server"

import matter from "gray-matter"
import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import {
  getAdminRepositoryConfig,
  type AdminRepositoryConfig,
  type AdminRepositorySlug,
} from "@/lib/admin-repositories"
import {
  assertValidDirectoryPath,
  assertValidFolderName,
  assertValidMarkdownPath,
  encodeGitHubPath,
  getGitHubHeaders,
  getParentPath,
  getRepositoryDocumentHref,
  getRepositoryFolderHref,
} from "@/lib/github-meetings"
import {
  normalizeMeetingFrontmatter,
  type MeetingFrontmatterData,
} from "@/lib/meeting-cms"

type GitHubWriteResponse = {
  content?: {
    path?: string
    sha?: string
  }
}

type GitHubContentsResponseItem = {
  path?: unknown
  sha?: unknown
  type?: unknown
}

type GitHubFileToDelete = {
  path: string
  sha: string
}

async function requireSession() {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Voce precisa estar autenticado para alterar documentos.")
  }
}

function getRepositoryConfig(repository: AdminRepositorySlug) {
  const config = getAdminRepositoryConfig(repository)

  if (!config) {
    throw new Error("Repositorio administrativo invalido.")
  }

  return config
}

function getContentsUrl(repository: AdminRepositoryConfig) {
  return `https://api.github.com/repos/${repository.owner}/${repository.repo}/contents`
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

function revalidateDocument(repository: AdminRepositorySlug, path: string) {
  const parentPath = getParentPath(path)

  revalidatePath(getRepositoryFolderHref(repository))
  revalidatePath(getRepositoryDocumentHref(repository, path))
  revalidatePath(getRepositoryFolderHref(repository, parentPath))
}

function revalidateFolder(repository: AdminRepositorySlug, path: string) {
  revalidatePath(getRepositoryFolderHref(repository))
  revalidatePath(getRepositoryFolderHref(repository, path))
}

function sanitizeFileName(fileName: string) {
  const normalized = fileName
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  if (
    !normalized ||
    normalized === "." ||
    normalized === ".." ||
    normalized.includes("/") ||
    normalized.includes("\\")
  ) {
    throw new Error("Nome de arquivo invalido.")
  }

  const extensionMatch = normalized.match(/\.([a-zA-Z0-9]+)$/)
  const extension = extensionMatch?.[1]?.toLowerCase() ?? "png"
  const baseName = normalized
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `${baseName || "image"}.${extension}`
}

function stripDataUrlPrefix(base64Content: string) {
  const content = base64Content.trim()
  const base64Marker = ";base64,"
  const markerIndex = content.indexOf(base64Marker)

  if (markerIndex >= 0) {
    return content.slice(markerIndex + base64Marker.length)
  }

  return content
}

function assertValidImageRelativePath(path: string) {
  const normalized = joinGitHubPath(path)
  const segments = normalized.split("/")

  if (
    !normalized.startsWith("imgs/") ||
    normalized === "imgs/" ||
    path.startsWith("/") ||
    path.includes("\\") ||
    segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error("Caminho de imagem invalido.")
  }

  return normalized
}

async function fetchDirectoryContents(
  repository: AdminRepositorySlug,
  path: string,
) {
  const config = getRepositoryConfig(repository)
  const encodedPath = encodeGitHubPath(path)
  const contentsUrl = getContentsUrl(config)
  const response = await fetch(
    encodedPath ? `${contentsUrl}/${encodedPath}` : contentsUrl,
    {
      cache: "no-store",
      headers: getGitHubHeaders(),
    },
  )

  await assertGitHubResponse(response)

  const contents = (await response.json()) as unknown

  if (!Array.isArray(contents)) {
    throw new Error("O caminho informado nao e uma pasta.")
  }

  return contents as GitHubContentsResponseItem[]
}

async function collectFolderFiles(
  repository: AdminRepositorySlug,
  path: string,
): Promise<GitHubFileToDelete[]> {
  const contents = await fetchDirectoryContents(repository, path)
  const files: GitHubFileToDelete[] = []

  for (const item of contents) {
    if (item.type === "dir") {
      if (typeof item.path !== "string") {
        throw new Error("A API do GitHub retornou uma pasta sem caminho.")
      }

      files.push(...(await collectFolderFiles(repository, item.path)))
      continue
    }

    if (item.type === "file") {
      if (typeof item.path !== "string" || typeof item.sha !== "string") {
        throw new Error("A API do GitHub retornou um arquivo sem path ou sha.")
      }

      files.push({
        path: item.path,
        sha: item.sha,
      })
    }
  }

  return files
}

export async function createRepositoryDocument(
  repository: AdminRepositorySlug,
  path: string,
  frontmatterData: MeetingFrontmatterData,
  markdownContent: string,
) {
  await requireSession()
  const config = getRepositoryConfig(repository)
  assertValidMarkdownPath(path)

  const response = await fetch(
    `${getContentsUrl(config)}/${encodeGitHubPath(path)}`,
    {
      method: "PUT",
      headers: getActionHeaders(),
      body: JSON.stringify({
        message: `Create ${config.repo} document: ${path}`,
        content: serializeMeetingContent(frontmatterData, markdownContent),
      }),
    },
  )

  await assertGitHubResponse(response)

  const result = (await response.json()) as GitHubWriteResponse
  const sha = result.content?.sha

  if (!sha) {
    throw new Error("O GitHub nao retornou o novo SHA do arquivo.")
  }

  revalidateDocument(repository, path)

  return {
    path: result.content?.path ?? path,
    sha,
  }
}

export async function updateRepositoryDocument(
  repository: AdminRepositorySlug,
  path: string,
  sha: string,
  frontmatterData: MeetingFrontmatterData,
  markdownContent: string,
) {
  await requireSession()
  const config = getRepositoryConfig(repository)
  assertValidMarkdownPath(path)
  assertValidSha(sha)

  const response = await fetch(
    `${getContentsUrl(config)}/${encodeGitHubPath(path)}`,
    {
      method: "PUT",
      headers: getActionHeaders(),
      body: JSON.stringify({
        message: `Update ${config.repo} document: ${path}`,
        content: serializeMeetingContent(frontmatterData, markdownContent),
        sha,
      }),
    },
  )

  await assertGitHubResponse(response)

  const result = (await response.json()) as GitHubWriteResponse
  const nextSha = result.content?.sha

  if (!nextSha) {
    throw new Error("O GitHub nao retornou o novo SHA do arquivo.")
  }

  revalidateDocument(repository, path)

  return {
    path: result.content?.path ?? path,
    sha: nextSha,
  }
}

export async function deleteRepositoryDocument(
  repository: AdminRepositorySlug,
  path: string,
  sha: string,
) {
  await requireSession()
  const config = getRepositoryConfig(repository)
  assertValidMarkdownPath(path)
  assertValidSha(sha)

  const response = await fetch(
    `${getContentsUrl(config)}/${encodeGitHubPath(path)}`,
    {
      method: "DELETE",
      headers: getActionHeaders(),
      body: JSON.stringify({
        message: `Delete ${config.repo} document: ${path}`,
        sha,
      }),
    },
  )

  await assertGitHubResponse(response)
  revalidateDocument(repository, path)

  return {
    path,
  }
}

export async function createRepositoryFolder(
  repository: AdminRepositorySlug,
  currentPath: string,
  folderName: string,
) {
  await requireSession()
  const config = getRepositoryConfig(repository)
  assertValidDirectoryPath(currentPath)

  const name = assertValidFolderName(folderName)
  const folderPath = joinGitHubPath(currentPath, name)
  const keepFilePath = joinGitHubPath(folderPath, ".gitkeep")

  const response = await fetch(
    `${getContentsUrl(config)}/${encodeGitHubPath(keepFilePath)}`,
    {
      method: "PUT",
      headers: getActionHeaders(),
      body: JSON.stringify({
        message: `Create folder in ${config.repo}: ${folderPath}`,
        content: Buffer.from("Keep directory", "utf8").toString("base64"),
      }),
    },
  )

  await assertGitHubResponse(response)
  revalidateFolder(repository, currentPath)

  return {
    path: folderPath,
  }
}

export async function uploadRepositoryImage(
  repository: AdminRepositorySlug,
  currentPath: string,
  fileName: string,
  base64Content: string,
) {
  await requireSession()
  const config = getRepositoryConfig(repository)
  assertValidDirectoryPath(currentPath)

  const safeFileName = sanitizeFileName(fileName)
  const content = stripDataUrlPrefix(base64Content)

  if (!content) {
    throw new Error("Conteudo da imagem nao informado.")
  }

  const relativePath = `imgs/${safeFileName}`
  const imagePath = joinGitHubPath(currentPath, relativePath)
  const response = await fetch(
    `${getContentsUrl(config)}/${encodeGitHubPath(imagePath)}`,
    {
      method: "PUT",
      headers: getActionHeaders(),
      body: JSON.stringify({
        message: `Upload image to ${config.repo}: ${imagePath}`,
        content,
      }),
    },
  )

  await assertGitHubResponse(response)

  const result = (await response.json()) as GitHubWriteResponse
  const sha = result.content?.sha

  if (!sha) {
    throw new Error("O GitHub nao retornou o SHA da imagem.")
  }

  revalidateFolder(repository, currentPath)

  return {
    path: relativePath,
    sha,
  }
}

export async function deleteRepositoryUploadedImage(
  repository: AdminRepositorySlug,
  currentPath: string,
  relativePath: string,
  sha: string,
) {
  await requireSession()
  const config = getRepositoryConfig(repository)
  assertValidDirectoryPath(currentPath)
  assertValidSha(sha)

  const safeRelativePath = assertValidImageRelativePath(relativePath)
  const imagePath = joinGitHubPath(currentPath, safeRelativePath)
  const response = await fetch(
    `${getContentsUrl(config)}/${encodeGitHubPath(imagePath)}`,
    {
      method: "DELETE",
      headers: getActionHeaders(),
      body: JSON.stringify({
        message: `Delete unsaved uploaded image from ${config.repo}: ${imagePath}`,
        sha,
      }),
    },
  )

  if (response.status !== 404) {
    await assertGitHubResponse(response)
  }

  revalidateFolder(repository, currentPath)
  revalidateFolder(repository, joinGitHubPath(currentPath, "imgs"))

  return {
    success: true,
  }
}

export async function deleteRepositoryFolder(
  repository: AdminRepositorySlug,
  folderPath: string,
) {
  await requireSession()
  const config = getRepositoryConfig(repository)
  assertValidDirectoryPath(folderPath)

  if (!folderPath.trim()) {
    throw new Error("Nao e possivel excluir a pasta raiz do repositorio.")
  }

  const files = await collectFolderFiles(repository, folderPath)

  for (const file of files) {
    const response = await fetch(
      `${getContentsUrl(config)}/${encodeGitHubPath(file.path)}`,
      {
        method: "DELETE",
        headers: getActionHeaders(),
        body: JSON.stringify({
          message: `Delete file from ${config.repo} folder ${folderPath}: ${file.path}`,
          sha: file.sha,
        }),
      },
    )

    await assertGitHubResponse(response)
  }

  const parentPath = getParentPath(folderPath)

  revalidateFolder(repository, parentPath)
  revalidatePath(getRepositoryFolderHref(repository, folderPath))

  return {
    success: true,
  }
}

export async function createMeeting(
  path: string,
  frontmatterData: MeetingFrontmatterData,
  markdownContent: string,
) {
  return createRepositoryDocument(
    "meetings",
    path,
    frontmatterData,
    markdownContent,
  )
}

export async function updateMeeting(
  path: string,
  sha: string,
  frontmatterData: MeetingFrontmatterData,
  markdownContent: string,
) {
  return updateRepositoryDocument(
    "meetings",
    path,
    sha,
    frontmatterData,
    markdownContent,
  )
}

export async function deleteMeeting(path: string, sha: string) {
  return deleteRepositoryDocument("meetings", path, sha)
}

export async function createFolder(currentPath: string, folderName: string) {
  return createRepositoryFolder("meetings", currentPath, folderName)
}

export async function uploadImage(
  currentPath: string,
  fileName: string,
  base64Content: string,
) {
  return uploadRepositoryImage(
    "meetings",
    currentPath,
    fileName,
    base64Content,
  )
}

export async function deleteUploadedImage(
  currentPath: string,
  relativePath: string,
  sha: string,
) {
  return deleteRepositoryUploadedImage(
    "meetings",
    currentPath,
    relativePath,
    sha,
  )
}

export async function deleteFolder(folderPath: string) {
  return deleteRepositoryFolder("meetings", folderPath)
}
