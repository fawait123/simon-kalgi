import { monitoringTrendQuerySchema } from '~~/shared/schemas/monitoring.schema'
import { monitoringService } from '~~/server/services/monitoring.service'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const { range } = monitoringTrendQuerySchema.parse(getQuery(event))
    return { data: await monitoringService.trend(range) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
