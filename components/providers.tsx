"use client"

import { LanguageProvider } from "@/components/language-context"
import { AccessibilityProvider } from "@/components/accessibility-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AccessibilityProvider>
        {children}
      </AccessibilityProvider>
    </LanguageProvider>
  )
}
