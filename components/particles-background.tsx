"use client"

import { useEffect, useRef } from "react"

type VantaDotsEffect = {
  destroy: () => void
  resize: () => void
}

const VANTA_COLORS = {
  background: 0x07111f,
  dots: 0x22d3ee,
  lines: 0x0ea5e9,
} as const

export function ParticlesBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = backgroundRef.current

    if (!element) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reducedMotion.matches) return

    let effect: VantaDotsEffect | null = null
    let cancelled = false
    let previousThree: typeof import("three") | undefined
    let installedThree: typeof import("three") | null = null

    async function initializeVanta() {
      const THREE = await import("three")
      const windowWithThree = window as Window & { THREE?: typeof THREE }
      previousThree = windowWithThree.THREE
      installedThree = THREE
      windowWithThree.THREE = THREE
      const { default: DOTS } = await import("vanta/dist/vanta.dots.min")

      if (cancelled || !backgroundRef.current) {
        if (windowWithThree.THREE === THREE) windowWithThree.THREE = previousThree
        return
      }

      effect = DOTS({
        el: backgroundRef.current,
        THREE,
        color: VANTA_COLORS.dots,
        color2: VANTA_COLORS.lines,
        backgroundColor: VANTA_COLORS.background,
        backgroundAlpha: 1,
        size: 2.4,
        spacing: 34,
        showLines: true,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1.15,
      })
    }

    void initializeVanta().catch(() => {
      // The CSS fallback remains visible if WebGL is unavailable.
    })

    return () => {
      cancelled = true
      effect?.destroy()
      const windowWithThree = window as Window & { THREE?: typeof import("three") }
      if (windowWithThree.THREE === installedThree) windowWithThree.THREE = previousThree
    }
  }, [])

  return (
    <div
      ref={backgroundRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#07111f]"
    >
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.08),transparent_42%),linear-gradient(180deg,rgba(7,17,31,0.18),rgba(7,17,31,0.62))]" />
    </div>
  )
}
