"use client"

import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"

type MarkdownContentProps = {
  content: string
  resolveImageSrc?: (source: string | undefined) => string
}

export function MarkdownContent({
  content,
  resolveImageSrc,
}: MarkdownContentProps) {
  return (
    <div className="admin-markdown prose prose-invert max-w-none prose-headings:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80 prose-code:text-primary prose-img:rounded-md prose-img:border prose-img:border-border prose-pre:border prose-pre:border-border prose-pre:bg-background prose-strong:text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
        components={{
          a: ({ node: _node, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer" />
          ),
          img: ({ node: _node, src, alt, ...props }) => (
            <img
              {...props}
              src={resolveImageSrc?.(typeof src === "string" ? src : undefined) ?? src}
              alt={alt ?? ""}
            />
          ),
          table: ({ node: _node, ...props }) => (
            <div className="my-4 overflow-x-auto rounded-md border border-border">
              <table
                {...props}
                className="my-0 w-full border-collapse text-left text-sm"
              />
            </div>
          ),
          thead: ({ node: _node, ...props }) => (
            <thead {...props} className="bg-secondary/80 text-primary" />
          ),
          th: ({ node: _node, ...props }) => (
            <th
              {...props}
              className="border-b border-border px-4 py-2 font-semibold"
            />
          ),
          td: ({ node: _node, ...props }) => (
            <td
              {...props}
              className="border-b border-border px-4 py-2 align-top text-foreground"
            />
          ),
          tr: ({ node: _node, ...props }) => (
            <tr {...props} className="hover:bg-secondary/50" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
