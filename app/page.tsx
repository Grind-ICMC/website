"use client"

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

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticlesBackground />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ICMCSection />
        <TracksSection />
        <HowItWorksSection />
        <ContentSection />
        <TeamSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
