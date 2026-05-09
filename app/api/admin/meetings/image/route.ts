import { auth } from "@/auth"
import { encodeGitHubPath, getGitHubHeaders } from "@/lib/github-meetings"

const OWNER = "Grind-ICMC"
const REPO = "meetings"
const CONTENTS_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents`

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
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

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const path = searchParams.get("path")?.trim() ?? ""
  const contentType = getImageContentType(path)

  if (!contentType || !isValidImagePath(path)) {
    return new Response("Invalid image path", { status: 400 })
  }

  const response = await fetch(`${CONTENTS_URL}/${encodeGitHubPath(path)}`, {
    cache: "no-store",
    headers: {
      ...getGitHubHeaders(),
      Accept: "application/vnd.github.raw",
    },
  })

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
