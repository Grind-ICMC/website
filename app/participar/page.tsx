"use client"

import Link from "next/link"
import { ArrowLeft, GraduationCap, Globe, Youtube, Calendar, MessageCircle } from "lucide-react"
import { FaInstagram, FaLinkedin, FaDiscord, FaYoutube } from "react-icons/fa"
import { GiIciclesAura } from "react-icons/gi"
import { useLanguage } from "@/components/language-context"
import { ParticlesBackground } from "@/components/particles-background"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const socialLinks = [
  { icon: FaYoutube, href: "https://www.youtube.com/@GrindICMC", label: "YouTube", color: "hover:bg-red-600" },
  { icon: FaInstagram, href: "https://instagram.com/grindicmc", label: "Instagram", color: "hover:bg-pink-600" },
  { icon: FaLinkedin, href: "https://linkedin.com/company/grindicmc", label: "LinkedIn", color: "hover:bg-blue-600" },
  { icon: FaDiscord, href: "https://discord.gg/grindicmc", label: "Discord", color: "hover:bg-indigo-600" },
]

function ParticiparContent() {
  const { language } = useLanguage()

  const externalContent = [
    { 
      icon: Youtube, 
      text: language === "pt" 
        ? "Conteúdos educacionais no YouTube com videoaulas sobre algoritmos, estruturas de dados, System Design e dicas de carreira"
        : "Educational content on YouTube with video lessons on algorithms, data structures, System Design and career tips"
    },
    { 
      icon: Calendar, 
      text: language === "pt"
        ? "Eventos e palestras abertas ao público com profissionais de Big Techs compartilhando suas experiências"
        : "Events and lectures open to the public with Big Tech professionals sharing their experiences"
    },
    { 
      icon: MessageCircle, 
      text: language === "pt"
        ? "Interação com nossa comunidade através das redes sociais, onde compartilhamos dicas, vagas e conteúdos relevantes"
        : "Interaction with our community through social media, where we share tips, job openings and relevant content"
    },
  ]

  return (
    <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20">
      {/* Back Link */}
      <Link 
        href="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12"
      >
        <ArrowLeft className="h-4 w-4" />
        {language === "pt" ? "Voltar para a página inicial" : "Back to home"}
      </Link>

      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-3 mb-6">
          <GiIciclesAura className="h-10 w-10 text-primary" />
          <span className="text-2xl font-bold">
            <span className="text-foreground">Grind </span>
            <span className="text-primary">ICMC</span>
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
          {language === "pt" ? "Como Participar" : "How to Participate"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {language === "pt" 
            ? "Entenda como você pode fazer parte ou consumir os conteúdos do Grind ICMC"
            : "Understand how you can join or consume Grind ICMC content"
          }
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-8 md:grid-cols-2 mb-16">
        {/* Internal Members Card */}
        <div className="rounded-2xl border border-primary/50 bg-card/50 backdrop-blur-sm p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {language === "pt" ? "Alunos USP" : "USP Students"}
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {language === "pt"
              ? "O Grind ICMC é um grupo de extensão universitária organizado por alunos da Universidade de São Paulo (USP). As inscrições para membros internos são abertas no início de cada semestre letivo para alunos regularmente matriculados."
              : "Grind ICMC is a university extension group organized by students from the University of São Paulo (USP). Applications for internal members are open at the beginning of each semester for regularly enrolled students."
            }
          </p>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm text-primary font-medium">
              {language === "pt" 
                ? "Inscrições abertas no início de cada semestre letivo"
                : "Applications open at the beginning of each semester"
              }
            </p>
          </div>
        </div>

        {/* External Public Card */}
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Globe className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {language === "pt" ? "Público Externo" : "External Public"}
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {language === "pt"
              ? "Mesmo não sendo aluno da USP, você pode consumir nossos conteúdos educacionais gratuitos feitos para o público externo. Isso inclui videoaulas no YouTube, eventos abertos e interação através das nossas redes sociais."
              : "Even if you're not a USP student, you can consume our free educational content made for the external public. This includes video lessons on YouTube, open events, and interaction through our social media."
            }
          </p>
        </div>
      </div>

      {/* Available Content Section */}
      <div className="rounded-2xl border border-border bg-card/30 backdrop-blur-sm p-8 mb-16">
        <h3 className="text-xl font-bold text-foreground mb-6">
          {language === "pt" ? "Conteúdos Disponíveis para Todos" : "Content Available for Everyone"}
        </h3>
        <ul className="space-y-4">
          {externalContent.map((item, index) => {
            const Icon = item.icon
            return (
              <li key={index} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-muted-foreground pt-2">{item.text}</p>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Connect Section */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-foreground mb-4">
          {language === "pt" ? "Conecte-se Conosco" : "Connect with Us"}
        </h3>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          {language === "pt"
            ? "Siga nossas redes sociais para ficar por dentro das novidades, vagas e conteúdos exclusivos"
            : "Follow our social media to stay updated on news, job openings and exclusive content"
          }
        </p>
        
        {/* Social Links */}
        <div className="flex justify-center gap-4">
          {socialLinks.map((social) => {
            const Icon = social.icon
            return (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-all ${social.color} hover:text-white`}
                aria-label={social.label}
              >
                <Icon className="h-5 w-5" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function ParticiparPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticlesBackground />
      <Navbar />
      <main className="pt-24">
        <ParticiparContent />
      </main>
      <Footer />
    </div>
  )
}
