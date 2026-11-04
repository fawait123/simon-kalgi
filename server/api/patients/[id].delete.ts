import { z } from 'zod'
import { ADMIN_ACCESS, STAFF_SCOPES } from '~~/shared/config/access'
import { createApiError, handleApiError } from '~~/server/utils/errors'
import { patientService } from '~~/server/services/patient.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireSession(event, { scopes: STAFF_SCOPES, accessLevels: ADMIN_ACCESS, action: 'menghapus data pasien' })
    const id = z.string().uuid('ID pasien tidak valid').parse(getRouterParam(event, 'id'))
    const patient = await patientService.remove(id)
    if (!patient)
      throw createApiError(404, 'Pasien tidak ditemukan.')
    return { data: { id } }
  } catch (error) {
    throw handleApiError(error)
  }
})
