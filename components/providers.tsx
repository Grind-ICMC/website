"use client"

import { LanguageProvider } from "@/components/language-context"
import { AccessibilityProvider } from "@/components/accessibility-context"
import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <AccessibilityProvider>
          {children}
        </AccessibilityProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
