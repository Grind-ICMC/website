import { auth } from "@/auth"
import { getAdminRepositoryConfig } from "@/lib/admin-repositories"
import { encodeGitHubPath, getGitHubHeaders } from "@/lib/github-meetings"

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
}

type ImageRouteContext = {
  params: Promise<{
    repository: string
  }>
}

function getImageContentType(path: string) {
  const extension = path.split(".").at(-1)?.toLowerCase()

  return extension ? IMAGE_CONTENT_TYPES[extension] : undefined
}

function isValidImagePath(path: string) {
  const segments = path.split("/").filter(Boolean)
  const contentType = getImageContentType(path)

  return (
    Boolean(contentType) &&
    segments.includes("imgs") &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    segments.every((segment) => segment !== "." && segment !== "..")
  )
}

export async function GET(request: Request, context: ImageRouteContext) {
  const session = await auth()

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { repository } = await context.params
  const repositoryConfig = getAdminRepositoryConfig(repository)

  if (!repositoryConfig) {
    return new Response("Repository not found", { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const path = searchParams.get("path")?.trim() ?? ""
  const contentType = getImageContentType(path)

  if (!contentType || !isValidImagePath(path)) {
    return new Response("Invalid image path", { status: 400 })
  }

  const response = await fetch(
    `https://api.github.com/repos/${repositoryConfig.owner}/${repositoryConfig.repo}/contents/${encodeGitHubPath(path)}`,
    {
      cache: "no-store",
      headers: {
        ...getGitHubHeaders(),
        Accept: "application/vnd.github.raw",
      },
    },
  )

  if (response.status === 404) {
    return new Response("Image not found", { status: 404 })
  }

  if (!response.ok) {
    return new Response("Unable to load image", { status: response.status })
  }

  return new Response(await response.arrayBuffer(), {
    headers: {
      "Cache-Control": "private, max-age=60",
      "Content-Type": contentType,
    },
  })
}
