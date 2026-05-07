"use client"

import { useState } from "react"
import Link from "next/link"
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
  { key: "nav.about", href: "#about" },
  { key: "nav.tracks", href: "#tracks" },
  { key: "nav.howItWorks", href: "#how-it-works" },
  { key: "nav.content", href: "#content" },
  { key: "nav.team", href: "#team" },
  { key: "nav.faq", href: "#faq" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const { highContrast, toggleHighContrast } = useAccessibility()

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Globe className="h-4 w-4" />
                  <span className="sr-only">Toggle language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setLanguage("pt")}
                  className={language === "pt" ? "bg-accent" : ""}
                >
                  <BrazilFlag className="h-4 w-5 mr-2 rounded-sm overflow-hidden" />
                  Português
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage("en")}
                  className={language === "en" ? "bg-accent" : ""}
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
            <Button className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90">
              {t("nav.login")}
            </Button>

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
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {t("nav.login")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
