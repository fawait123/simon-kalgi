import { z } from 'zod'
import { ADMIN_ACCESS, STAFF_SCOPES } from '~~/shared/config/access'
import { createApiError, handleApiError } from '~~/server/utils/errors'
import { patientService } from '~~/server/services/patient.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Detail ini memuat NIK dan alamat lengkap, jadi khusus administrator.
    await requireSession(event, { scopes: STAFF_SCOPES, accessLevels: ADMIN_ACCESS, action: 'membuka detail pasien' })
    const id = z.string().uuid('ID pasien tidak valid').parse(getRouterParam(event, 'id'))
    const patient = await patientService.getById(id)
    if (!patient)
      throw createApiError(404, 'Pasien tidak ditemukan.')
    return { data: patient }
  } catch (error) {
    throw handleApiError(error)
  }
})
