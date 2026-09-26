import { auth } from "@/auth"
import { getGitHubRateLimit } from "@/lib/github-rate-limit"

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const quota = await getGitHubRateLimit()

    return Response.json(quota, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    })
  } catch {
    return Response.json(
      { message: "Unable to read GitHub rate limit" },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    )
  }
}
