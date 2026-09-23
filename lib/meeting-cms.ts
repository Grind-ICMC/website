export type MeetingFrontmatterData = {
  title: string
  author?: string
  // The filename is the source of truth. An empty date means unknown.
  date: string
}

export type MeetingEditorValues = MeetingFrontmatterData & {
  content: string
}

export function isValidDocumentDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  )
}

export function getDocumentDate(path: string) {
  const name = path.split("/").at(-1) ?? ""
  const date = name.match(/^(\d{4}-\d{2}-\d{2})-(?=.+\.md$)/i)?.[1] ?? ""
  return isValidDocumentDate(date) ? date : ""
}

export function getDocumentNameWithoutDate(path: string) {
  const name = path.split("/").at(-1) ?? ""
  return getDocumentDate(path) ? name.slice(11) : name
}

export function getDatedDocumentPath(path: string, date: string) {
  if (!date) return path
  if (!isValidDocumentDate(date)) throw new Error("Informe uma data válida.")
  const segments = path.split("/")
  segments[segments.length - 1] = `${date}-${getDocumentNameWithoutDate(path)}`
  return segments.join("/")
}

export function formatDocumentDate(date: string) {
  return isValidDocumentDate(date) ? date.split("-").reverse().join("/") : "?"
}

export function normalizeMeetingFrontmatter(
  input: MeetingFrontmatterData,
  options: { requireAuthor?: boolean; requireDate?: boolean } = {},
): MeetingFrontmatterData {
  const title = input.title.trim()
  const author = input.author?.trim() ?? ""
  const date = input.date.trim()

  if (!title) throw new Error("Informe o título do documento.")
  if ((options.requireAuthor ?? true) && !author) {
    throw new Error("Informe o autor do documento.")
  }
  if ((date || options.requireDate) && !isValidDocumentDate(date)) {
    throw new Error("Informe uma data válida.")
  }

  return { title, ...(author ? { author } : {}), date }
}

export function getMeetingFrontmatterForForm(
  frontmatter: Record<string, unknown>,
  fallbackTitle: string,
  path: string,
): MeetingFrontmatterData {
  return {
    title:
      typeof frontmatter.title === "string" && frontmatter.title.trim()
        ? frontmatter.title.trim()
        : fallbackTitle,
    author:
      typeof frontmatter.author === "string" ? frontmatter.author.trim() : "",
    date: getDocumentDate(path),
  }
}

export function getTodayInputDate() {
  const now = new Date()
  const localTime = now.getTime() - now.getTimezoneOffset() * 60_000
  return new Date(localTime).toISOString().slice(0, 10)
}

export function slugifyMeetingTitle(title: string) {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || "documento"
}

export function getGeneratedMeetingPath(date: string, title: string) {
  return getDatedDocumentPath(`${slugifyMeetingTitle(title)}.md`, date)
}
