"use client"

import { useEffect, useRef } from "react"
import { MarkdownContent } from "@/components/admin/markdown-content"

export function DocumentReader({ content, resolveImageSrc, paginated }: {
  content: string
  resolveImageSrc: (source: string | undefined) => string
  paginated: boolean
}) {
  const sourceRef = useRef<HTMLDivElement>(null)
  const pagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const source = sourceRef.current?.querySelector<HTMLElement>(".admin-markdown")
    const pages = pagesRef.current
    if (!source || !pages || !paginated) return
    let frame = 0
    let disposed = false
    let width = 0

    const build = () => {
      if (disposed) return
      pages.replaceChildren()
      const createPage = () => {
        const page = document.createElement("section")
        page.className = "document-page document-readonly-page"
        page.setAttribute("aria-label", `Página ${pages.childElementCount + 1}`)
        const body = source.cloneNode(false) as HTMLElement
        page.append(body)
        pages.append(page)
        return { page, body }
      }
      let { page, body } = createPage()
      for (const child of Array.from(source.children)) {
        const clone = child.cloneNode(true)
        body.append(clone)
        const pageHeight = parseFloat(getComputedStyle(page).minHeight)
        if (page.getBoundingClientRect().height > pageHeight + 1 && body.childElementCount > 1) {
          body.removeChild(clone)
          ;({ page, body } = createPage())
          body.append(clone)
        }
      }
      // A block taller than a sheet expands its page rather than clipping text,
      // tables, or images. All links remain real, keyboard-accessible anchors.
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(build)
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width !== width) {
        width = entry.contentRect.width
        schedule()
      }
    })
    observer.observe(pages)
    source.addEventListener("load", schedule, true)
    void document.fonts.ready.then(() => { if (!disposed) schedule() })
    schedule()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      source.removeEventListener("load", schedule, true)
    }
  }, [content, resolveImageSrc, paginated])

  return (
    <div className="document-workspace overflow-x-auto px-2 py-5 sm:px-5 sm:py-8">
      <div ref={sourceRef} className="document-page document-readonly-page" hidden={paginated}>
        <MarkdownContent content={content} resolveImageSrc={resolveImageSrc} />
      </div>
      {paginated && <div ref={pagesRef} className="flex flex-col items-center gap-8" aria-label="Documento em páginas" />}
    </div>
  )
}
