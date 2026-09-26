"use client"

import { useEffect } from "react"

// A neutral center preserves the view through the glass. The colored edges
// bend the backdrop inward, using the same SVG displacement approach as
// liquid-glass-react, without applying a filter to the foreground content.
const edgeMap = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><defs><linearGradient id="x"><stop stop-color="#008080"/><stop offset=".08" stop-color="#808080"/><stop offset=".92" stop-color="#808080"/><stop offset="1" stop-color="#ff8080"/></linearGradient><linearGradient id="y" x2="0" y2="1"><stop stop-color="#800080"/><stop offset=".08" stop-color="#808080" stop-opacity="0"/><stop offset=".92" stop-color="#808080" stop-opacity="0"/><stop offset="1" stop-color="#80ff80"/></linearGradient></defs><path fill="url(#x)" d="M0 0h256v256H0z"/><path fill="url(#y)" d="M0 0h256v256H0z"/></svg>`)}`

const surfaceSelector = ".liquid-glass, .liquid-glass-header, .liquid-glass-control, .liquid-glass-field, [data-slot=card], [data-slot$='-content']"

export function LiquidGlassEffects() {
  useEffect(() => {
    const root = document.documentElement
    // SVG backdrop displacement is currently reliable in Chromium. Other
    // engines retain the translucent, highlighted CSS glass treatment.
    if (/Chrome|Chromium|Edg\//.test(navigator.userAgent)) {
      root.dataset.glassRefraction = "true"
    }
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0
    let previous: HTMLElement[] = []

    const reset = () => {
      previous.forEach((element) => {
        element.style.removeProperty("--glass-x")
        element.style.removeProperty("--glass-y")
      })
      previous = []
    }
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      if (motion.matches || event.pointerType !== "mouse" || !(event.target instanceof Element)) return
      const target = event.target
      const { clientX, clientY } = event
      frame = requestAnimationFrame(() => {
        reset()
        let element = target.closest<HTMLElement>(surfaceSelector)
        while (element) {
          const rect = element.getBoundingClientRect()
          if (rect.width && rect.height) {
            element.style.setProperty("--glass-x", `${((clientX - rect.left) / rect.width) * 100}%`)
            element.style.setProperty("--glass-y", `${((clientY - rect.top) / rect.height) * 100}%`)
            previous.push(element)
          }
          element = element.parentElement?.closest<HTMLElement>(surfaceSelector) ?? null
        }
      })
    }
    const leave = () => {
      cancelAnimationFrame(frame)
      reset()
    }
    document.addEventListener("pointermove", move, { passive: true })
    document.documentElement.addEventListener("pointerleave", leave)
    window.addEventListener("blur", leave)
    return () => {
      leave()
      delete root.dataset.glassRefraction
      document.removeEventListener("pointermove", move)
      document.documentElement.removeEventListener("pointerleave", leave)
      window.removeEventListener("blur", leave)
    }
  }, [])

  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="pointer-events-none absolute">
      <defs>
        <filter id="liquid-glass-refraction" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feImage href={edgeMap} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="edges" />
          <feDisplacementMap in="SourceGraphic" in2="edges" scale="18" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}
