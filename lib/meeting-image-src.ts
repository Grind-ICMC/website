import type { AdminRepositorySlug } from "@/lib/admin-repositories"

function isPassthroughImageSrc(source: string) {
  return (
    source.startsWith("http://") ||
    source.startsWith("https://") ||
    source.startsWith("data:") ||
    source.startsWith("blob:") ||
    source.startsWith("/")
  )
}

function normalizeRepoPath(...parts: string[]) {
  const segments: string[] = []

  for (const segment of parts
    .flatMap((part) => part.split("/"))
    .map((part) => part.trim())) {
    if (!segment || segment === ".") {
      continue
    }

    if (segment === "..") {
      segments.pop()
      continue
    }

    segments.push(segment)
  }

  return segments.join("/")
}

export function getMeetingDocumentDirectory(path: string) {
  return normalizeRepoPath(path).split("/").filter(Boolean).slice(0, -1).join("/")
}

export function getRepositoryImageSrc(
  repository: AdminRepositorySlug,
  documentDirectory: string,
  source: string,
) {
  if (!source || isPassthroughImageSrc(source)) {
    return source
  }

  const imagePath = normalizeRepoPath(documentDirectory, source)

  return `/api/admin/${repository}/image?path=${encodeURIComponent(imagePath)}`
}

export function getMeetingImageSrc(documentDirectory: string, source: string) {
  return getRepositoryImageSrc("meetings", documentDirectory, source)
}
