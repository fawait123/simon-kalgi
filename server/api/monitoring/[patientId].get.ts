import { z } from 'zod'
import { handleApiError } from '~~/server/utils/errors'
import { monitoringService } from '~~/server/services/monitoring.service'

export default defineEventHandler(async (event) => {
  try {
    const patientId = z.string().uuid('ID pasien tidak valid').parse(getRouterParam(event, 'patientId'))
    return { data: await monitoringService.detail(patientId) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
