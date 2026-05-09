export const MEETING_CATEGORIES = [
  "Geral",
  "Diretoria",
  "Mock Interview",
] as const

export type MeetingCategory = (typeof MEETING_CATEGORIES)[number]

export type MeetingFrontmatterData = {
  title: string
  author: string
  date: string
  category: MeetingCategory
  tags: string[]
}

export type MeetingEditorValues = MeetingFrontmatterData & {
  content: string
}

type MeetingFrontmatterInput = Omit<MeetingFrontmatterData, "tags"> & {
  tags: string | string[]
}

export function isMeetingCategory(value: unknown): value is MeetingCategory {
  return (
    typeof value === "string" &&
    MEETING_CATEGORIES.includes(value as MeetingCategory)
  )
}

export function parseTags(value: string | string[]) {
  const tags = Array.isArray(value) ? value : value.split(",")
  const seen = new Set<string>()

  return tags
    .map((tag) => tag.trim())
    .filter((tag) => {
      const key = tag.toLowerCase()

      if (!tag || seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
}

export function tagsToInput(tags: string[]) {
  return tags.join(", ")
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function readDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }

  const date = readString(value)
  return date.length >= 10 ? date.slice(0, 10) : date
}

function assertValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Informe uma data no formato YYYY-MM-DD.")
  }

  const date = new Date(`${value}T00:00:00.000Z`)

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error("Informe uma data valida.")
  }
}

export function normalizeMeetingFrontmatter(
  input: MeetingFrontmatterInput,
): MeetingFrontmatterData {
  const title = input.title.trim()
  const author = input.author.trim()
  const date = input.date.trim()
  const category = input.category
  const tags = parseTags(input.tags)

  if (!title) {
    throw new Error("Informe o titulo do documento.")
  }

  if (!author) {
    throw new Error("Informe o autor do documento.")
  }

  assertValidDate(date)

  if (!isMeetingCategory(category)) {
    throw new Error("Selecione uma categoria valida.")
  }

  return {
    title,
    author,
    date,
    category,
    tags,
  }
}

export function getMeetingFrontmatterForForm(
  frontmatter: Record<string, unknown>,
  fallbackTitle: string,
): MeetingFrontmatterData {
  const category = frontmatter.category
  const tags = frontmatter.tags

  return {
    title: readString(frontmatter.title) || fallbackTitle,
    author: readString(frontmatter.author),
    date: readDate(frontmatter.date),
    category: isMeetingCategory(category) ? category : "Geral",
    tags: Array.isArray(tags)
      ? parseTags(tags.filter((tag): tag is string => typeof tag === "string"))
      : parseTags(readString(tags)),
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
  return `${date}-${slugifyMeetingTitle(title)}.md`
}
