import { z } from 'zod'
import { updatePatientSchema } from '~~/shared/schemas/patient.schema'
import { ADMIN_ACCESS, STAFF_SCOPES } from '~~/shared/config/access'
import { createApiError, handleApiError } from '~~/server/utils/errors'
import { patientService } from '~~/server/services/patient.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireSession(event, { scopes: STAFF_SCOPES, accessLevels: ADMIN_ACCESS, action: 'mengubah data pasien' })
    const id = z.string().uuid('ID pasien tidak valid').parse(getRouterParam(event, 'id'))
    const body = await readValidatedBody(event, (data) => updatePatientSchema.parse(data))
    const patient = await patientService.update(id, body)
    if (!patient)
      throw createApiError(404, 'Pasien tidak ditemukan.')
    return { data: patient }
  } catch (error) {
    throw handleApiError(error)
  }
})
