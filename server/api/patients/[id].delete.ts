import { z } from 'zod'
import { createApiError, handleApiError } from '~~/server/utils/errors'
import { patientService } from '~~/server/services/patient.service'

export default defineEventHandler(async (event) => {
  try {
    const id = z.string().uuid('ID pasien tidak valid').parse(getRouterParam(event, 'id'))
    const patient = await patientService.remove(id)
    if (!patient)
      throw createApiError(404, 'Pasien tidak ditemukan.')
    return { data: { id } }
  } catch (error) {
    throw handleApiError(error)
  }
})
