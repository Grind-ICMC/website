import { auth, getMissingGitHubAuthEnvVars, signIn } from "@/auth"
import { LoginPageContent } from "@/components/login-page-content"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Login interno",
  description: "Acesso interno para membros do Grind ICMC.",
  robots: {
    index: false,
    follow: false,
  },
}

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[]
    error?: string | string[]
  }>
}

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function getSafeRedirectPath(
  value: FormDataEntryValue | string | null | undefined,
) {
  if (typeof value !== "string") {
    return "/admin/meetings"
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/admin/meetings"
  }

  return value
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth()

  if (session?.user) {
    redirect("/admin/meetings")
  }

  const params = await searchParams
  const error = getSearchParam(params.error)
  const callbackUrl = getSafeRedirectPath(getSearchParam(params.callbackUrl))
  const isUnauthorized = error === "Unauthorized" || error === "AccessDenied"
  const missingGitHubAuthEnvVars = getMissingGitHubAuthEnvVars()
  const isGitHubAuthConfigured = missingGitHubAuthEnvVars.length === 0

  async function signInWithGitHub(formData: FormData) {
    "use server"

    if (getMissingGitHubAuthEnvVars().length > 0) {
      redirect("/login?error=Configuration")
    }

    await signIn("github", {
      redirectTo: getSafeRedirectPath(formData.get("redirectTo")),
    })
  }

  return (
    <LoginPageContent
      callbackUrl={callbackUrl}
      error={error}
      isGitHubAuthConfigured={isGitHubAuthConfigured}
      isUnauthorized={isUnauthorized}
      missingGitHubAuthEnvVars={missingGitHubAuthEnvVars}
      signInAction={signInWithGitHub}
    />
  )
}
