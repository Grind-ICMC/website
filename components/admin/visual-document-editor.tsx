"use client"

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react"
import { EditorContent, useEditor, useEditorState } from "@tiptap/react"
import Image from "@tiptap/extension-image"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  SquareCode,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Minus,
  Link2,
  ImagePlus,
  Undo2,
  Redo2,
  Table2,
  Unlink,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import {
  createDocumentEditorExtensions,
  documentCodeLanguages as languages,
} from "@/lib/document-editor"
const selectClass =
  "h-9 max-w-full rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"

export type VisualDocumentEditorHandle = {
  rememberSelection: () => void
  insertImage: (src: string, alt: string) => void
}

type Props = {
  editorRef: Ref<VisualDocumentEditorHandle>
  content: string
  onChange: (markdown: string) => void
  resolveImageSrc: (source: string) => string
  onUploadImage: () => void
  onPasteImage: (file: File) => void
  disabled: boolean
  compactHeader?: boolean
}

function Tool({
  label,
  icon: Icon,
  active,
  disabled,
  onClick,
}: {
  label: string
  icon: LucideIcon
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "size-9 shrink-0 text-muted-foreground hover:bg-primary/10 hover:text-primary",
        active && "bg-primary/15 text-primary",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </Button>
  )
}

function Divider() {
  return (
    <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden="true" />
  )
}

export function VisualDocumentEditor({
  content,
  onChange,
  resolveImageSrc,
  onUploadImage,
  onPasteImage,
  disabled,
  editorRef,
  compactHeader = false,
}: Props) {
  const callbacks = useRef({ onChange, resolveImageSrc, onPasteImage })
  callbacks.current = { onChange, resolveImageSrc, onPasteImage }
  const imageSelection = useRef<{ from: number; to: number } | null>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkError, setLinkError] = useState("")
  const editor = useEditor({
    immediatelyRender: false,
    extensions: createDocumentEditorExtensions(
      Image.extend({
        addNodeView() {
          return ({ node }) => {
            const img = document.createElement("img")
            img.src = callbacks.current.resolveImageSrc(node.attrs.src)
            img.alt = node.attrs.alt ?? ""
            if (node.attrs.title) img.title = node.attrs.title
            return { dom: img }
          }
        },
      }),
    ),
    content,
    contentType: "markdown",
    editorProps: {
      attributes: {
        class:
          "document-page admin-markdown prose prose-invert max-w-none focus:outline-none",
        role: "textbox",
        "aria-label": "Conteúdo do documento",
        "aria-multiline": "true",
        "data-placeholder": "Comece a escrever seu documento…",
      },
      handlePaste(view, event) {
        const file = Array.from(event.clipboardData?.files ?? []).find((file) =>
          file.type.startsWith("image/"),
        )
        if (!file) return false
        imageSelection.current = {
          from: view.state.selection.from,
          to: view.state.selection.to,
        }
        callbacks.current.onPasteImage(file)
        return true
      },
      handleDrop(_view, event) {
        const file = Array.from(event.dataTransfer?.files ?? []).find((file) =>
          file.type.startsWith("image/"),
        )
        if (!file) return false
        callbacks.current.onPasteImage(file)
        return true
      },
    },
    onUpdate: ({ editor }) => callbacks.current.onChange(editor.getMarkdown()),
  })
  useEditorState({
    editor,
    selector: ({ transactionNumber }) => transactionNumber,
  })
  const state = editor
    ? {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        strike: editor.isActive("strike"),
        code: editor.isActive("code"),
        codeBlock: editor.isActive("codeBlock"),
        bullet: editor.isActive("bulletList"),
        ordered: editor.isActive("orderedList"),
        task: editor.isActive("taskList"),
        quote: editor.isActive("blockquote"),
        link: editor.isActive("link"),
        table: editor.isActive("table"),
        heading: editor.isActive("heading")
          ? String(editor.getAttributes("heading").level)
          : "0",
        language: editor.getAttributes("codeBlock").language || "plaintext",
        undo: editor.can().undo(),
        redo: editor.can().redo(),
      }
    : null

  useEffect(() => {
    editor?.setEditable(!disabled, false)
  }, [editor, disabled])
  useImperativeHandle(
    editorRef,
    () => ({
      rememberSelection() {
        if (editor)
          imageSelection.current = {
            from: editor.state.selection.from,
            to: editor.state.selection.to,
          }
      },
      insertImage(src, alt) {
        if (!editor) return
        const selection = imageSelection.current ?? editor.state.selection
        editor
          .chain()
          .focus()
          .setTextSelection(selection)
          .setImage({ src, alt })
          .run()
        imageSelection.current = null
      },
    }),
    [editor],
  )

  function applyLink() {
    const url = linkUrl.trim()
    if (!url) {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      if (!/^(https?:\/\/|mailto:|tel:|#|\/|\.\.?\/)/i.test(url)) {
        setLinkError(
          "Use um endereço com https://, mailto: ou um caminho relativo.",
        )
        return
      }
      if (editor?.state.selection.empty && !editor.isActive("link")) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "text",
            text: url,
            marks: [{ type: "link", attrs: { href: url } }],
          })
          .run()
      } else {
        editor
          ?.chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run()
      }
    }
    setLinkOpen(false)
  }

  if (!editor || !state)
    return (
      <div
        className="min-h-[640px] animate-pulse rounded-xl border border-border bg-card"
        aria-label="Carregando editor"
      />
    )

  return (
    <div className="rounded-xl border border-border bg-background/50">
      <fieldset
        disabled={disabled}
        aria-label="Ferramentas de formatação"
        className={`${compactHeader ? "document-editor-toolbar" : "sticky top-2"} z-10 min-w-0 rounded-t-xl border-b border-border bg-card p-2 shadow-sm disabled:opacity-50`}
      >
        <div className="flex flex-wrap items-center gap-0.5">
          <Tool
            label="Desfazer"
            icon={Undo2}
            disabled={!state.undo}
            onClick={() => editor.chain().focus().undo().run()}
          />
          <Tool
            label="Refazer"
            icon={Redo2}
            disabled={!state.redo}
            onClick={() => editor.chain().focus().redo().run()}
          />
          <Divider />
          <select
            aria-label="Estilo e tamanho do texto"
            value={state.heading}
            className={cn(selectClass, "w-40")}
            onChange={(event) => {
              const level = Number(event.target.value)
              if (level === 0) editor.chain().focus().setParagraph().run()
              else
                editor
                  .chain()
                  .focus()
                  .setHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                  .run()
            }}
          >
            <option value="0">Texto normal</option>
            <option value="1">Título 1 · maior</option>
            <option value="2">Título 2 · grande</option>
            <option value="3">Título 3 · médio</option>
            <option value="4">Título 4</option>
            <option value="5">Título 5</option>
            <option value="6">Título 6 · menor</option>
          </select>
          <Divider />
          <Tool
            label="Negrito"
            icon={Bold}
            active={state.bold}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <Tool
            label="Itálico"
            icon={Italic}
            active={state.italic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <Tool
            label="Tachado"
            icon={Strikethrough}
            active={state.strike}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
          <Tool
            label="Código em linha"
            icon={Code}
            active={state.code}
            onClick={() => editor.chain().focus().toggleCode().run()}
          />
          <Divider />
          <Tool
            label="Lista com marcadores"
            icon={List}
            active={state.bullet}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <Tool
            label="Lista numerada"
            icon={ListOrdered}
            active={state.ordered}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <Tool
            label="Lista de tarefas"
            icon={ListTodo}
            active={state.task}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          />
          <Tool
            label="Citação"
            icon={Quote}
            active={state.quote}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
          <Divider />
          <Popover
            open={linkOpen}
            onOpenChange={(open) => {
              setLinkOpen(open)
              if (open) {
                setLinkUrl(editor.getAttributes("link").href ?? "")
                setLinkError("")
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "size-9",
                  state.link && "bg-primary/15 text-primary",
                )}
                title="Inserir ou editar link"
                aria-label="Inserir ou editar link"
                aria-pressed={state.link}
              >
                <Link2 className="size-4" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="space-y-3"
              onCloseAutoFocus={(event) => event.preventDefault()}
            >
              <label className="block text-sm font-medium">
                Endereço do link
                <Input
                  className="mt-2"
                  placeholder="https://exemplo.com"
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      applyLink()
                    }
                  }}
                />
              </label>
              {linkError && (
                <p role="alert" className="text-xs text-red-300">
                  {linkError}
                </p>
              )}
              <div className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .extendMarkRange("link")
                      .unsetLink()
                      .run()
                    setLinkOpen(false)
                  }}
                >
                  <Unlink className="size-4" />
                  Remover
                </Button>
                <Button type="button" size="sm" onClick={applyLink}>
                  Aplicar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Tool
            label="Inserir imagem"
            icon={ImagePlus}
            onClick={onUploadImage}
          />
          <Tool
            label="Bloco de código"
            icon={SquareCode}
            active={state.codeBlock}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          />
          <Tool
            label="Inserir tabela"
            icon={Table2}
            disabled={state.table}
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          />
          <Tool
            label="Linha divisória"
            icon={Minus}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          />
        </div>
        {state.codeBlock && (
          <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-border pt-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Linguagem
              <select
                aria-label="Linguagem do bloco de código"
                className={selectClass}
                value={state.language}
                onChange={(event) =>
                  editor
                    .chain()
                    .focus()
                    .updateAttributes("codeBlock", {
                      language: event.target.value,
                    })
                    .run()
                }
              >
                <option value="plaintext">Texto simples</option>
                {!languages.includes(state.language) &&
                  state.language !== "plaintext" && (
                    <option value={state.language}>{state.language}</option>
                  )}
                {languages
                  .filter((language) => language !== "plaintext")
                  .map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
              </select>
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().exitCode().run()}
            >
              Continuar texto
            </Button>
          </div>
        )}
        {state.table && (
          <div className="mt-2 flex flex-wrap gap-1 border-t border-border pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              + Linha
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              + Coluna
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteRow().run()}
            >
              Excluir linha
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteColumn().run()}
            >
              Excluir coluna
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteTable().run()}
            >
              Excluir tabela
            </Button>
          </div>
        )}
      </fieldset>
      <div
        className={`document-workspace overflow-x-auto px-2 py-5 sm:px-5 sm:py-8 ${compactHeader ? "document-editor-workspace-with-fixed-tools" : ""}`}
      >
        <EditorContent editor={editor} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-b-xl border-t border-border bg-card px-4 py-2.5 text-xs text-muted-foreground">
        <span>Editor visual</span>
        <span>Selecione o texto para formatar · Cole imagens com Ctrl+V</span>
      </div>
    </div>
  )
}
