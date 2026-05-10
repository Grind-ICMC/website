import "server-only"

import matter from "gray-matter"

const OWNER = "Grind-ICMC"
const REPO = "meetings"
const GITHUB_API_VERSION = "2022-11-28"
const CONTENTS_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents`

export type GitHubContentItem = {
  name: string
  path: string
  type: "file" | "dir" | string
}

type GitHubFileContent = GitHubContentItem & {
  content?: string
  encoding?: string
  sha?: string
}

export type MeetingSummary = {
  name: string
  path: string
  title: string
  directory: string
}

export type MeetingMarkdown = MeetingSummary & {
  content: string
  frontmatter: Record<string, unknown>
  sha: string
}

export type MeetingDirectoryContents = {
  path: string
  directories: GitHubContentItem[]
  files: MeetingSummary[]
}

export class InvalidMeetingPathError extends Error {}
export class GitHubContentNotFoundError extends Error {}

export function getGitHubHeaders() {
  const token = process.env.GITHUB_ADMIN_TOKEN

  if (!token) {
    throw new Error("Missing GITHUB_ADMIN_TOKEN")
  }

  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "grind-icmc-website",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  }
}

export function encodeGitHubPath(path: string) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")
}

export function assertValidMarkdownPath(path: string) {
  const segments = path.split("/")

  if (
    !path ||
    path.startsWith("/") ||
    path.includes("\\") ||
    !path.toLowerCase().endsWith(".md") ||
    segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new InvalidMeetingPathError("Invalid meeting path")
  }
}

export function assertValidDirectoryPath(path: string) {
  const segments = path.split("/").filter(Boolean)

  if (
    path.startsWith("/") ||
    path.includes("\\") ||
    path.toLowerCase().endsWith(".md") ||
    segments.some((segment) => segment === "." || segment === "..")
  ) {
    throw new InvalidMeetingPathError("Invalid directory path")
  }
}

export function assertValidFolderName(folderName: string) {
  const name = folderName.trim()

  if (
    !name ||
    name === "." ||
    name === ".." ||
    name.includes("/") ||
    name.includes("\\")
  ) {
    throw new InvalidMeetingPathError("Invalid folder name")
  }

  return name
}

async function fetchGitHubContents(path = "") {
  const encodedPath = encodeGitHubPath(path)
  const response = await fetch(
    encodedPath ? `${CONTENTS_URL}/${encodedPath}` : CONTENTS_URL,
    {
      cache: "no-store",
      headers: getGitHubHeaders(),
    },
  )

  if (response.status === 404) {
    throw new GitHubContentNotFoundError("GitHub content not found")
  }

  if (!response.ok) {
    throw new Error(`GitHub API request failed with status ${response.status}`)
  }

  return (await response.json()) as unknown
}

function getDisplayTitle(path: string, frontmatter: Record<string, unknown>) {
  const frontmatterTitle = frontmatter.title

  if (typeof frontmatterTitle === "string" && frontmatterTitle.trim()) {
    return frontmatterTitle.trim()
  }

  return path
    .split("/")
    .at(-1)!
    .replace(/\.md$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function getDirectory(path: string) {
  const segments = path.split("/")
  return segments.length > 1 ? segments.slice(0, -1).join("/") : "Raiz"
}

function isHiddenDirectory(item: GitHubContentItem) {
  return item.name.toLowerCase() === "imgs"
}

async function getMeetingSummary(item: GitHubContentItem) {
  try {
    const meeting = await getMeetingMarkdown(item.path)
    return {
      name: meeting.name,
      path: meeting.path,
      title: meeting.title,
      directory: meeting.directory,
    } satisfies MeetingSummary
  } catch {
    return {
      name: item.name,
      path: item.path,
      title: getDisplayTitle(item.path, {}),
      directory: getDirectory(item.path),
    } satisfies MeetingSummary
  }
}

export function getMeetingHref(path: string) {
  return `/admin/meetings/doc/${encodeGitHubPath(path)}`
}

export function getMeetingFolderHref(path = "") {
  const encodedPath = encodeGitHubPath(path)

  if (!encodedPath) {
    return "/admin/meetings"
  }

  return `/admin/meetings/${encodedPath}`
}

export function getParentPath(path: string) {
  return path.split("/").filter(Boolean).slice(0, -1).join("/")
}

export async function getMeetingDirectory(
  path = "",
): Promise<MeetingDirectoryContents> {
  assertValidDirectoryPath(path)

  const contents = await fetchGitHubContents(path)

  if (!Array.isArray(contents)) {
    throw new GitHubContentNotFoundError("GitHub directory not found")
  }

  const directories = contents
    .filter(
      (item: GitHubContentItem) =>
        item.type === "dir" && !isHiddenDirectory(item),
    )
    .sort((left, right) => left.name.localeCompare(right.name))
  const markdownFiles = contents
    .filter(
      (item: GitHubContentItem) =>
        item.type === "file" &&
        item.name !== ".gitkeep" &&
        item.name.toLowerCase().endsWith(".md"),
    )
    .sort((left, right) => left.name.localeCompare(right.name))
  const files = await Promise.all(markdownFiles.map(getMeetingSummary))

  return {
    path,
    directories,
    files,
  }
}

export async function getMeetingFiles(path = ""): Promise<MeetingSummary[]> {
  const contents = await fetchGitHubContents(path)

  if (!Array.isArray(contents)) {
    return []
  }

  const meetings = await Promise.all(
    contents.map(async (item: GitHubContentItem) => {
      if (item.type === "dir") {
        return getMeetingFiles(item.path)
      }

      if (item.type === "file" && item.name.toLowerCase().endsWith(".md")) {
        return [await getMeetingSummary(item)]
      }

      return []
    }),
  )

  return meetings
    .flat()
    .sort((left, right) => right.path.localeCompare(left.path))
}

export async function getMeetingMarkdown(path: string): Promise<MeetingMarkdown> {
  assertValidMarkdownPath(path)

  const content = await fetchGitHubContents(path)

  if (
    Array.isArray(content) ||
    typeof content !== "object" ||
    content === null ||
    (content as GitHubFileContent).type !== "file"
  ) {
    throw new GitHubContentNotFoundError("GitHub file not found")
  }

  const file = content as GitHubFileContent

  if (file.encoding !== "base64" || !file.content) {
    throw new Error("GitHub file content is not base64 encoded")
  }

  if (!file.sha) {
    throw new Error("GitHub file sha is missing")
  }

  const raw = Buffer.from(file.content.replace(/\n/g, ""), "base64").toString(
    "utf8",
  )
  const parsed = matter(raw)
  const frontmatter = parsed.data as Record<string, unknown>

  return {
    name: file.name,
    path: file.path,
    title: getDisplayTitle(file.path, frontmatter),
    directory: getDirectory(file.path),
    content: parsed.content,
    frontmatter,
    sha: file.sha,
  }
}
