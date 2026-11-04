import { readSessionClaims } from '~~/server/utils/auth'

// Prefix yang boleh dibuka cookie portal pasien. Selain ini, seluruh `/api/` milik petugas.
const PATIENT_ALLOWED = ['/api/auth/', '/api/patient-care/', '/api/patient-profile/'] as const

export default defineEventHandler(async (event) => {
  const path = event.path.split('?')[0] ?? '/'
  if (!path.startsWith('/api/')) return
  // `event.path` untuk route index tidak selalu berakhir dengan "/" (mis. `/api/patient-profile`),
  // jadi bandingkan juga dengan prefix tanpa trailing slash.
  if (PATIENT_ALLOWED.some(prefix => path === prefix.slice(0, -1) || path.startsWith(prefix))) return

  const claims = await readSessionClaims(event)
  if (claims?.scope === 'patient')
    throw createError({ statusCode: 403, statusMessage: 'Portal pasien belum dapat mengakses data klinik ini.' })
})
