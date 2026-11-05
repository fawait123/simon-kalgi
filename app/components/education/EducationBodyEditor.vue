<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import type { Component } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'
import { TableKit } from '@tiptap/extension-table'
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Redo2,
  Strikethrough,
  Table,
  TextQuote,
  Underline,
  Undo2,
} from 'lucide-vue-next'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emits = defineEmits<{
  'update:modelValue': [value: string]
}>()

// ProseMirror tidak reaktif secara bawaan; tick ini memaksa toolbar re-render tiap transaksi.
const renderTick = ref(0)

const editor = useEditor({
  content: props.modelValue ?? '',
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      link: { openOnClick: false },
    }),
    Placeholder.configure({
      placeholder: props.placeholder ?? 'Tulis konten edukasi di sini...',
    }),
    TableKit.configure({ table: { resizable: false } }),
  ],
  onUpdate: ({ editor }) => emits('update:modelValue', editor.getHTML()),
  onTransaction: () => { renderTick.value += 1 },
})

watch(
  () => props.modelValue,
  (value) => {
    const current = editor.value?.getHTML()
    if (!editor.value || (value ?? '') === current) return
    editor.value.commands.setContent(value ?? '', { emitUpdate: false })
  },
)

function isActive(name: string, attrs?: Record<string, number>) {
  void renderTick.value
  return editor.value?.isActive(name, attrs) ?? false
}

function canUndo() {
  void renderTick.value
  return editor.value?.can().undo() ?? false
}

function canRedo() {
  void renderTick.value
  return editor.value?.can().redo() ?? false
}

function setLink() {
  const instance = editor.value
  if (!instance) return
  const previous = String(instance.getAttributes('link').href ?? '')
  const url = window.prompt('Masukkan URL tautan', previous || 'https://')
  if (url === null) return
  if (url.trim() === '' || url.trim() === 'https://') {
    instance.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  instance.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
}

interface ToolbarButton {
  icon: Component
  label: string
  active?: () => boolean
  enabled?: () => boolean
  run: (editor: Editor) => void
}

const formatButtons: ToolbarButton[] = [
  { icon: Heading2, label: 'Sub judul 2', active: () => isActive('heading', { level: 2 }), run: e => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { icon: Heading3, label: 'Sub judul 3', active: () => isActive('heading', { level: 3 }), run: e => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { icon: Bold, label: 'Tebal', active: () => isActive('bold'), run: e => e.chain().focus().toggleBold().run() },
  { icon: Italic, label: 'Miring', active: () => isActive('italic'), run: e => e.chain().focus().toggleItalic().run() },
  { icon: Underline, label: 'Garis bawah', active: () => isActive('underline'), run: e => e.chain().focus().toggleUnderline().run() },
  { icon: Strikethrough, label: 'Coret', active: () => isActive('strike'), run: e => e.chain().focus().toggleStrike().run() },
]

const blockButtons: ToolbarButton[] = [
  { icon: List, label: 'Daftar butir', active: () => isActive('bulletList'), run: e => e.chain().focus().toggleBulletList().run() },
  { icon: ListOrdered, label: 'Daftar bernomor', active: () => isActive('orderedList'), run: e => e.chain().focus().toggleOrderedList().run() },
  { icon: TextQuote, label: 'Kutipan', active: () => isActive('blockquote'), run: e => e.chain().focus().toggleBlockquote().run() },
  { icon: Minus, label: 'Garis pemisah', run: e => e.chain().focus().setHorizontalRule().run() },
]

const linkButtons: ToolbarButton[] = [
  { icon: Link2, label: 'Sisipkan tautan', active: () => isActive('link'), run: setLink },
  { icon: Link2Off, label: 'Hapus tautan', active: () => isActive('link'), run: e => e.chain().focus().extendMarkRange('link').unsetLink().run() },
]

const tableButtons: ToolbarButton[] = [
  { icon: Table, label: 'Sisipkan tabel', run: e => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { icon: List, label: 'Tambah baris', active: () => isActive('table'), run: e => e.chain().focus().addRowAfter().run() },
  { icon: ListOrdered, label: 'Tambah kolom', active: () => isActive('table'), run: e => e.chain().focus().addColumnAfter().run() },
  { icon: Minus, label: 'Hapus tabel', active: () => isActive('table'), run: e => e.chain().focus().deleteTable().run() },
]

const historyButtons: ToolbarButton[] = [
  { icon: Undo2, label: 'Urungkan', enabled: canUndo, run: e => e.chain().focus().undo().run() },
  { icon: Redo2, label: 'Ulangi', enabled: canRedo, run: e => e.chain().focus().redo().run() },
]
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring/50">
    <div class="flex flex-wrap items-center gap-0.5 border-b border-border-subtle bg-bg-canvas px-1.5 py-1">
      <template v-for="(group, groupIndex) in [formatButtons, blockButtons, linkButtons, tableButtons, historyButtons]" :key="groupIndex">
        <span v-if="groupIndex > 0" class="mx-1 h-5 w-px shrink-0 bg-border-subtle" aria-hidden="true" />
        <button
          v-for="btn in group"
          :key="btn.label"
          type="button"
          :title="btn.label"
          :aria-label="btn.label"
          :aria-pressed="btn.active ? btn.active() : undefined"
          :disabled="btn.enabled ? !btn.enabled() : false"
          class="flex size-8 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-primary-surface hover:text-primary disabled:pointer-events-none disabled:opacity-40"
          :class="btn.active?.() ? 'bg-primary-surface text-primary' : ''"
          @click="editor && btn.run(editor)"
        >
          <component :is="btn.icon" class="size-4" aria-hidden="true" />
        </button>
      </template>
    </div>

    <EditorContent
      :editor="editor"
      class="max-h-[45vh] overflow-y-auto [&_.ProseMirror]:min-h-[240px] [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2.5 [&_.ProseMirror]:outline-none [&_.ProseMirror]:font-body-md [&_.ProseMirror]:text-body-md [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:text-text-secondary [&_.ProseMirror_h2]:mt-4 [&_.ProseMirror_h2]:mb-1.5 [&_.ProseMirror_h2]:font-headline-md [&_.ProseMirror_h2]:text-headline-md [&_.ProseMirror_h2]:text-text-primary [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-1.5 [&_.ProseMirror_h3]:font-headline-sm [&_.ProseMirror_h3]:text-headline-sm [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:text-text-primary [&_.ProseMirror_p]:my-2 [&_.ProseMirror_a]:font-label-md [&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-border-subtle [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_blockquote]:text-text-muted [&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:space-y-1 [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:my-2 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:space-y-1 [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_strong]:text-text-primary [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:table-fixed [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-border-subtle [&_.ProseMirror_td]:px-2 [&_.ProseMirror_td]:py-1.5 [&_.ProseMirror_td]:align-top [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-border-subtle [&_.ProseMirror_th]:bg-bg-canvas [&_.ProseMirror_th]:px-2 [&_.ProseMirror_th]:py-1.5 [&_.ProseMirror_th]:text-left [&_.ProseMirror_th]:font-label-sm [&_.ProseMirror_th]:text-label-sm [&_.ProseMirror_selectedCell]:bg-primary-surface/60"
    />
  </div>
</template>
