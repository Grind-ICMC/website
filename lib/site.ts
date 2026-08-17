const fallbackSiteUrl = "http://localhost:3000"

function parseSiteUrl(value: string | undefined) {
  const candidate = value?.trim()

  if (!candidate) {
    return undefined
  }

  const url = /^[a-z][a-z\d+.-]*:\/\//i.test(candidate)
    ? candidate
    : `https://${candidate}`

  try {
    return new URL(url)
  } catch {
    return undefined
  }
}

export const siteUrl =
  parseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
  parseSiteUrl(process.env.URL) ||
  parseSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  parseSiteUrl(process.env.VERCEL_URL) ||
  new URL(fallbackSiteUrl)

export const siteConfig = {
  name: "Grind ICMC",
  description:
    "Grupo de extensao do ICMC-USP focado em preparacao para processos seletivos em tecnologia, dados e IA, cobrindo Engineering, Science, entrevistas tecnicas, cases e soft skills.",
  url: siteUrl,
  links: {
    github: "https://github.com/Grind-ICMC",
    instagram: "https://www.instagram.com/grind.icmc/",
    linkedin: "https://www.linkedin.com/company/grind-icmc",
    youtube: "https://www.youtube.com/@GrindICMC",
    icmc: "https://www.icmc.usp.br/",
  },
}

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString()
}
