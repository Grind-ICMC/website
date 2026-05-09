import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

const REQUIRED_ORG = "Grind-ICMC"
const GITHUB_ORGS_URL = "https://api.github.com/user/orgs?per_page=100"
const GITHUB_API_VERSION = "2022-11-28"
const GITHUB_CLIENT_ID_ENV = "AUTH_GITHUB_ID"
const GITHUB_CLIENT_SECRET_ENV = "AUTH_GITHUB_SECRET"

type GitHubOrg = {
  login?: unknown
}

function readEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value || value === "undefined" || value === "null") {
    return undefined
  }

  return value
}

export function getMissingGitHubAuthEnvVars() {
  return [
    [GITHUB_CLIENT_ID_ENV, readEnv(GITHUB_CLIENT_ID_ENV)],
    [GITHUB_CLIENT_SECRET_ENV, readEnv(GITHUB_CLIENT_SECRET_ENV)],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name)
}

export function isGitHubAuthConfigured() {
  return getMissingGitHubAuthEnvVars().length === 0
}

async function userBelongsToRequiredOrg(accessToken: string) {
  let nextUrl: string | null = GITHUB_ORGS_URL

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "grind-icmc-website",
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
      },
    })

    if (!response.ok) {
      return false
    }

    const orgs: unknown = await response.json()

    if (
      Array.isArray(orgs) &&
      orgs.some(
        (org) =>
          typeof org === "object" &&
          org !== null &&
          (org as GitHubOrg).login === REQUIRED_ORG,
      )
    ) {
      return true
    }

    nextUrl = getNextPageUrl(response.headers.get("link"))
  }

  return false
}

function getNextPageUrl(linkHeader: string | null) {
  if (!linkHeader) {
    return null
  }

  const nextLink = linkHeader
    .split(",")
    .map((link) => link.trim())
    .find((link) => link.includes('rel="next"'))

  const match = nextLink?.match(/<([^>]+)>/)
  return match?.[1] ?? null
}

const providers = isGitHubAuthConfigured()
  ? [
      GitHub({
        clientId: readEnv(GITHUB_CLIENT_ID_ENV)!,
        clientSecret: readEnv(GITHUB_CLIENT_SECRET_ENV)!,
        authorization: {
          params: {
            scope: "read:user user:email read:org",
          },
        },
      }),
    ]
  : []

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers,
  callbacks: {
    async signIn({ account }) {
      if (account?.provider !== "github" || !account.access_token) {
        return "/login?error=Unauthorized"
      }

      const isAuthorized = await userBelongsToRequiredOrg(account.access_token)
      return isAuthorized ? true : "/login?error=Unauthorized"
    },
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name
        token.email = user.email
        token.picture = user.image
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name =
          typeof token.name === "string" ? token.name : session.user.name
        session.user.email =
          typeof token.email === "string" ? token.email : session.user.email
        session.user.image =
          typeof token.picture === "string" ? token.picture : session.user.image
      }

      return session
    },
  },
})
