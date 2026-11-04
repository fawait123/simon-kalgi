import { z } from 'zod'
import { monitoringService } from '~~/server/services/monitoring.service'
import { readSessionClaims } from '~~/server/utils/auth'
import { createApiError, handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await readSessionClaims(event)
    if (!claims)
      throw createApiError(401, 'Sesi berakhir. Masuk kembali untuk mengirim pengingat.')

    const patientId = z.string().uuid('ID pasien tidak valid').parse(getRouterParam(event, 'patientId'))
    return { data: await monitoringService.reminder(patientId, { userId: claims.sub, fullName: claims.fullName }) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
