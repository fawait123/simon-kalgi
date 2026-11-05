import DOMPurify from 'dompurify'
import { marked } from 'marked'

/** Body artikel Markdown → HTML aman. Hanya dipakai di browser (reader dialog pasien). */
export function renderMarkdown(markdown: string): string {
  if (import.meta.server)
    return ''
  const html = marked.parse(markdown, { async: false })
  return DOMPurify.sanitize(typeof html === 'string' ? html : '')
}
