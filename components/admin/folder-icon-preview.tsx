"use client"

import { useState } from "react"
import { Folder } from "lucide-react"
import { cn } from "@/lib/utils"

type FolderIconPreviewProps = {
  src?: string
  alt: string
  className?: string
}

export function FolderIconPreview({
  src,
  alt,
  className,
}: FolderIconPreviewProps) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
          className,
        )}
        aria-label={alt}
      >
        <Folder className="size-5" aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn(
        "size-11 shrink-0 rounded-xl border border-primary/20 bg-primary/10 object-cover shadow-sm",
        className,
      )}
    />
  )
}
