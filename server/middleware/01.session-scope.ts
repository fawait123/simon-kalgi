import { readSessionClaims } from '~~/server/utils/auth'

// Prefix yang boleh dibuka cookie portal pasien. Selain ini, seluruh `/api/` milik petugas.
const PATIENT_ALLOWED = ['/api/auth/', '/api/patient-care/'] as const

export default defineEventHandler(async (event) => {
  if (!event.path.split('?')[0]?.startsWith('/api/')) return
  if (PATIENT_ALLOWED.some((prefix) => event.path.startsWith(prefix))) return

  const claims = await readSessionClaims(event)
  if (claims?.scope === 'patient')
    throw createError({ statusCode: 403, statusMessage: 'Portal pasien belum dapat mengakses data klinik ini.' })
})
