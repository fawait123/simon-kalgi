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

const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatShortDateId(value: string | Date | null) {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : shortDateFormatter.format(date).replace('.', '')
}

export function calcAge(birthDate: string | Date) {
  const date = birthDate instanceof Date ? birthDate : new Date(birthDate)
  if (Number.isNaN(date.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - date.getFullYear()
  const beforeBirthday
    = now.getMonth() < date.getMonth()
      || (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())
  if (beforeBirthday) age -= 1
  return age
}

export function formatVisitSchedule(value: string | Date | null) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  const now = new Date()
  const startOfDay = (input: Date) => new Date(input.getFullYear(), input.getMonth(), input.getDate()).getTime()
  const diffDays = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000)
  if (diffDays === 0) return `Hari ini, ${time}`
  if (diffDays === 1) return `Besok, ${time}`
  if (diffDays === -1) return `Kemarin, ${time}`
  return formatShortDateId(date)
}

export function initialsOf(fullName: string) {
  const words = fullName
    .replace(/,.*$/, '')
    .split(/\s+/)
    .filter(word => word && !titleTokens.has(word.toLowerCase()))
  const initials = words.slice(0, 2).map(word => word.slice(0, 1).toUpperCase()).join('')
  return initials || '?'
}
