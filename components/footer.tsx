"use client"

import Link from "next/link"
import { GiIciclesAura } from "react-icons/gi"
import { FaGithub, FaYoutube, FaLinkedin } from "react-icons/fa"
import { useLanguage } from "@/components/language-context"

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/Grind-ICMC",
    icon: FaGithub,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@GrindICMC",
    icon: FaYoutube,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/grind-icmc",
    icon: FaLinkedin,
  },
]

export function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <GiIciclesAura className="h-7 w-7 text-primary" aria-hidden="true" />
            <span className="text-lg font-bold">
              <span className="text-foreground">Grind </span>
              <span className="text-primary">ICMC</span>
            </span>
          </Link>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={link.name}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Grind ICMC. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  )
}
