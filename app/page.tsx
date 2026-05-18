import { ParticlesBackground } from "@/components/particles-background"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { ICMCSection } from "@/components/icmc-section"
import { TracksSection } from "@/components/tracks-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { ContentSection } from "@/components/content-section"
import { TeamSection } from "@/components/team-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { getOrganizationMembers } from "@/lib/github-members"
import { absoluteUrl, siteConfig } from "@/lib/site"

export default async function Home() {
  const members = await getOrganizationMembers({
    next: {
      revalidate: 3600,
    },
  }).catch(() => [])
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/favicon.svg"),
    description: siteConfig.description,
    sameAs: [
      siteConfig.links.github,
      siteConfig.links.instagram,
      siteConfig.links.linkedin,
      siteConfig.links.youtube,
    ],
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "Instituto de Ciências Matemáticas e de Computação da USP",
      url: siteConfig.links.icmc,
    },
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ParticlesBackground />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ICMCSection />
        <TracksSection />
        <HowItWorksSection />
        <ContentSection />
        <TeamSection members={members} />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
