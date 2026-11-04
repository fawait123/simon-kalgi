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

export function formatRelativeTimeId(value: string | Date | null) {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const seconds = Math.round((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Baru saja'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return formatShortDateId(date)
}

const utcDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const utcLongDateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/** Tanggal dibaca sebagai wall-clock UTC supaya jadwal tidak bergeser ke zona lokal. */
export function formatUtcShortDate(value: string | Date | null) {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : utcDateFormatter.format(date).replace('.', '')
}

export function formatUtcLongDate(value: string | Date | null) {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : utcLongDateFormatter.format(date)
}

export function formatUtcTime(value: string | Date | null) {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`
}

export function initialsOf(fullName: string) {
  const words = fullName
    .replace(/,.*$/, '')
    .split(/\s+/)
    .filter(word => word && !titleTokens.has(word.toLowerCase()))
  const initials = words.slice(0, 2).map(word => word.slice(0, 1).toUpperCase()).join('')
  return initials || '?'
}
