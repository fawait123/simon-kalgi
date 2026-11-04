import { monitoringService } from '~~/server/services/monitoring.service'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async () => {
  try {
    return { data: await monitoringService.stats() }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
