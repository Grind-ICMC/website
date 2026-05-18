const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  "http://localhost:3000"

export const siteUrl = new URL(rawSiteUrl)

export const siteConfig = {
  name: "Grind ICMC",
  description:
    "Grupo de extensao do ICMC-USP focado em preparacao tecnica para entrevistas de computacao, Big Tech, algoritmos, System Design e carreira em tecnologia.",
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
