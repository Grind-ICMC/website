import "server-only"

import alumniHandles from "@/data/team-alumni.json"
import teamRoles from "@/data/team-roles.json"

type GitHubOrgMember = {
  id: number
  login: string
  avatar_url: string
  html_url: string
}

type TeamRoleConfig = Record<
  string,
  {
    pt: string
    en?: string
  }
>

export type OrganizationMember = {
  id: number
  login: string
  avatarUrl: string
  htmlUrl: string
  isAlumni: boolean
  role: {
    pt: string
    en: string
  }
}

type GitHubMembersFetchOptions = {
  cache?: RequestCache
  next?: {
    revalidate?: number | false
  }
}

const GITHUB_MEMBERS_URL = "https://api.github.com/orgs/Grind-ICMC/members"
const DEFAULT_ROLE = {
  pt: "Membro",
  en: "Member",
}

function normalizeHandle(handle: string) {
  return handle.trim().replace(/^@/, "").toLowerCase()
}

function getGitHubHeaders(useToken: boolean) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "grind-icmc-website",
    "X-GitHub-Api-Version": "2022-11-28",
  }

  if (useToken && process.env.GITHUB_ADMIN_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_ADMIN_TOKEN}`
  }

  return headers
}

async function fetchMembers(
  useToken = false,
  options: GitHubMembersFetchOptions = {},
) {
  return fetch(GITHUB_MEMBERS_URL, {
    cache: options.cache,
    headers: getGitHubHeaders(useToken),
    next: options.next,
  })
}

function getMemberRole(login: string) {
  const role = (teamRoles as TeamRoleConfig)[normalizeHandle(login)]

  if (!role) {
    return DEFAULT_ROLE
  }

  return {
    pt: role.pt,
    en: role.en ?? role.pt,
  }
}

export async function getOrganizationMembers(
  options: GitHubMembersFetchOptions = {},
) {
  let response = await fetchMembers(false, options)

  if (!response.ok && process.env.GITHUB_ADMIN_TOKEN) {
    response = await fetchMembers(true, options)
  }

  if (!response.ok) {
    throw new Error(`GitHub members request failed with ${response.status}`)
  }

  const alumni = new Set((alumniHandles as string[]).map(normalizeHandle))
  const members = (await response.json()) as GitHubOrgMember[]

  if (!Array.isArray(members)) {
    throw new Error("GitHub members response is not an array")
  }

  return members
    .map((member) => {
      const login = normalizeHandle(member.login)

      return {
        id: member.id,
        login: member.login,
        avatarUrl: member.avatar_url,
        htmlUrl: member.html_url,
        isAlumni: alumni.has(login),
        role: getMemberRole(login),
      } satisfies OrganizationMember
    })
    .sort((left, right) => left.login.localeCompare(right.login))
}
