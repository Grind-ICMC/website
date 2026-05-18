import type { Metadata } from "next"
import type { ReactNode } from "react"
import { absoluteUrl, siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Como participar | Grind ICMC",
  description:
    "Veja como participar do Grind ICMC, grupo de extensao do ICMC-USP, e acompanhe conteudos gratuitos sobre algoritmos, entrevistas tecnicas e carreira em tecnologia.",
  alternates: {
    canonical: absoluteUrl("/participar"),
  },
  openGraph: {
    title: "Como participar | Grind ICMC",
    description:
      "Participe do Grind ICMC ou acompanhe nossos conteudos gratuitos sobre entrevistas tecnicas, algoritmos e carreira em tecnologia.",
    url: absoluteUrl("/participar"),
    siteName: siteConfig.name,
    locale: "pt_BR",
    type: "website",
  },
}

export default function ParticiparLayout({ children }: { children: ReactNode }) {
  return children
}
