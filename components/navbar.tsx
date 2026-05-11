"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { GiIciclesAura } from "react-icons/gi"
import { Menu, X, Eye, EyeOff, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-context"
import { useAccessibility } from "@/components/accessibility-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Flag icons as SVG components
function BrazilFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="480" fill="#229E45"/>
      <polygon points="320,40 600,240 320,440 40,240" fill="#F8E509"/>
      <circle cx="320" cy="240" r="100" fill="#2B49A3"/>
      <path d="M200,240 Q320,180 440,240 Q320,200 200,240" fill="white"/>
    </svg>
  )
}

function USAFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="480" fill="#BD3D44"/>
      <rect y="37" width="640" height="37" fill="white"/>
      <rect y="111" width="640" height="37" fill="white"/>
      <rect y="185" width="640" height="37" fill="white"/>
      <rect y="259" width="640" height="37" fill="white"/>
      <rect y="333" width="640" height="37" fill="white"/>
      <rect y="407" width="640" height="37" fill="white"/>
      <rect width="260" height="260" fill="#192F5D"/>
    </svg>
  )
}

const navLinks = [
  { key: "nav.about", href: "/#about" },
  { key: "nav.tracks", href: "/#tracks" },
  { key: "nav.howItWorks", href: "/#how-it-works" },
  { key: "nav.content", href: "/#content" },
  { key: "nav.team", href: "/#team" },
  { key: "nav.faq", href: "/#faq" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const { highContrast, toggleHighContrast } = useAccessibility()
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <GiIciclesAura className="h-8 w-8 text-primary" aria-hidden="true" />
            <span className="text-xl font-bold">
              <span className="text-foreground">Grind </span>
              <span className="text-primary">ICMC</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Globe className="h-4 w-4" />
                  <span className="sr-only">Toggle language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setLanguage("pt")}
                  className={language === "pt" ? "bg-accent text-slate-950 font-medium" : ""}
                >
                  <BrazilFlag className="h-4 w-5 mr-2 rounded-sm overflow-hidden" />
                  Português
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage("en")}
                  className={language === "en" ? "bg-accent text-slate-950 font-medium" : ""}
                >
                  <USAFlag className="h-4 w-5 mr-2 rounded-sm overflow-hidden" />
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* High Contrast Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={toggleHighContrast}
              aria-label={highContrast ? "Disable high contrast" : "Enable high contrast"}
            >
              {highContrast ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>

            {/* Login Button */}
            {session ? (
              <Link href="/admin" aria-label="Painel Administrativo">
                <div className="hidden sm:flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-primary/50 hover:border-primary transition-colors cursor-pointer">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "Perfil"}
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {session.user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
              </Link>
            ) : (
              <Button asChild className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/login">{t("nav.login")}</Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="border-t border-border/50 py-4 lg:hidden">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {t(link.key)}
                </Link>
              ))}
              {session ? (
                <Link 
                  href="/admin"
                  className="flex items-center justify-center gap-3 w-full p-2 rounded-md bg-accent/50 hover:bg-accent transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-primary/50">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "Perfil"}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {session.user?.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium">Painel Administrativo</span>
                </Link>
              ) : (
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsOpen(false)}>
                  <Link href="/login">{t("nav.login")}</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
