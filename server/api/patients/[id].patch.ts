import { z } from 'zod'
import { updatePatientSchema } from '~~/shared/schemas/patient.schema'
import { createApiError, handleApiError } from '~~/server/utils/errors'
import { patientService } from '~~/server/services/patient.service'

export default defineEventHandler(async (event) => {
  const id = z.string().uuid('ID pasien tidak valid').parse(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, (data) => updatePatientSchema.parse(data))
  try {
    const patient = await patientService.update(id, body)
    if (!patient)
      throw createApiError(404, 'Pasien tidak ditemukan.')
    return { data: patient }
  } catch (error) {
    throw handleApiError(error)
  }
})
