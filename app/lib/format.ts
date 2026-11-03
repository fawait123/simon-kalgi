const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatDateId(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : dateFormatter.format(date)
}

const titleTokens = new Set(['drg.', 'dr.', 'drf.', 'ns.', 'drh.', 'prof.'])

export function initialsOf(fullName: string) {
  const words = fullName
    .replace(/,.*$/, '')
    .split(/\s+/)
    .filter(word => word && !titleTokens.has(word.toLowerCase()))
  const initials = words.slice(0, 2).map(word => word.slice(0, 1).toUpperCase()).join('')
  return initials || '?'
}
