import "server-only"

import { getGitHubHeaders } from "@/lib/github-meetings"

const GITHUB_USAGE_URL = "https://api.github.com/repos/Grind-ICMC/meetings"

export type GitHubRateLimit = {
  limit: number
  used: number
  remaining: number
  resetAt: string
}

function readNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null
  }

  const number = typeof value === "number" ? value : Number(value)

  return Number.isFinite(number) ? number : null
}

export async function getGitHubRateLimit(): Promise<GitHubRateLimit> {
  const response = await fetch(GITHUB_USAGE_URL, {
    cache: "no-store",
    headers: getGitHubHeaders(),
  })

  if (!response.ok) {
    throw new Error(`GitHub rate limit request failed with ${response.status}`)
  }

  const limit = readNumber(response.headers.get("x-ratelimit-limit"))
  const used = readNumber(response.headers.get("x-ratelimit-used"))
  const remaining = readNumber(response.headers.get("x-ratelimit-remaining"))
  const reset = readNumber(response.headers.get("x-ratelimit-reset"))

  if (limit === null || used === null || remaining === null || reset === null || limit <= 0) {
    throw new Error("GitHub returned invalid rate limit headers")
  }

  return {
    limit,
    used,
    remaining,
    resetAt: new Date(reset * 1000).toISOString(),
  }
}
