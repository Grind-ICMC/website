import assert from "node:assert/strict"
import test from "node:test"
import { MarkdownManager } from "@tiptap/markdown"
import { createDocumentEditorExtensions } from "../lib/document-editor"

const markdown = new MarkdownManager({
  extensions: createDocumentEditorExtensions(),
})
const fixtures = {
  formatting:
    "# Título\n\n## Subtítulo\n\nTexto **forte**, *itálico*, ~~riscado~~ e `código`.\n\n[Link](https://example.com)",
  lists:
    "- Item\n  - Subitem\n\n1. Primeiro\n2. Segundo\n\n- [ ] Pendente\n- [x] Pronto",
  table: "| Nome | Valor |\n| --- | --- |\n| **Teste** | `a` |",
  image: '![Diagrama](imgs/diagrama.png "Título da imagem")',
  code: '```python\ndef hello():\n    print("Olá")\n```',
  fences: "````markdown\n# Exemplo\n```js\nconst x = 1\n```\n````",
  quote: "> Uma citação\n>\n> Mais texto\n\n---\n\nDepois",
}
for (const [name, source] of Object.entries(fixtures)) {
  test(`visual/Markdown conversion preserves ${name}`, () => {
    const parsed = markdown.parse(source)
    assert.deepEqual(markdown.parse(markdown.serialize(parsed)), parsed)
  })
}
