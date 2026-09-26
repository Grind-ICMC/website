import "server-only"

import { getGitHubHeaders } from "@/lib/github-meetings"

const GITHUB_RATE_LIMIT_URL = "https://api.github.com/rate_limit"

type GitHubRateLimitResponse = {
  resources?: {
    core?: {
      limit?: unknown
      used?: unknown
      remaining?: unknown
      reset?: unknown
    }
  }
}

export type GitHubRateLimit = {
  limit: number
  used: number
  remaining: number
  resetAt: string
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

export async function getGitHubRateLimit(): Promise<GitHubRateLimit> {
  const response = await fetch(GITHUB_RATE_LIMIT_URL, {
    cache: "no-store",
    headers: getGitHubHeaders(),
  })

  if (!response.ok) {
    throw new Error(`GitHub rate limit request failed with ${response.status}`)
  }

  const body = (await response.json()) as GitHubRateLimitResponse
  const core = body.resources?.core
  const limit = readNumber(core?.limit)
  const used = readNumber(core?.used)
  const remaining = readNumber(core?.remaining)
  const reset = readNumber(core?.reset)

  if (limit === null || used === null || remaining === null || reset === null || limit <= 0) {
    throw new Error("GitHub returned an invalid rate limit response")
  }

  return {
    limit,
    used,
    remaining,
    resetAt: new Date(reset * 1000).toISOString(),
  }
}
