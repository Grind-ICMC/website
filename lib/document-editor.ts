import type { AnyExtension } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "@tiptap/markdown"
import Image from "@tiptap/extension-image"
import { TableKit } from "@tiptap/extension-table"
import { TaskList, TaskItem } from "@tiptap/extension-list"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"

const lowlight = createLowlight(common)
export const documentCodeLanguages = lowlight.listLanguages().sort()

// Code examples can contain Markdown fences themselves. Use a longer fence so
// switching modes or saving cannot accidentally turn code into document text.
const DocumentCodeBlock = CodeBlockLowlight.extend({
  renderMarkdown(node, helpers) {
    const code = helpers.renderChildren(node.content ?? [])
    const longestRun = Math.max(
      2,
      ...Array.from(code.matchAll(/`+/g), (match) => match[0].length),
    )
    const fence = "`".repeat(longestRun + 1)
    return `${fence}${node.attrs?.language || ""}\n${code}\n${fence}`
  },
})

export function createDocumentEditorExtensions(image: AnyExtension = Image) {
  return [
    StarterKit.configure({
      codeBlock: false,
      underline: false,
      link: { openOnClick: false },
    }),
    Markdown,
    image,
    TableKit.configure({ table: { resizable: false } }),
    TaskList,
    TaskItem.configure({
      nested: true,
      HTMLAttributes: { "data-type": "taskItem" },
    }),
    DocumentCodeBlock.configure({ lowlight, defaultLanguage: "plaintext" }),
  ]
}
