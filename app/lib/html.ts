import DOMPurify from 'dompurify'

/** Body artikel HTML dari editor → aman untuk v-html. Hanya dipakai di browser. */
export function sanitizeHtml(html: string): string {
  if (import.meta.server)
    return ''
  return DOMPurify.sanitize(html)
}
