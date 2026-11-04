import { monitoringListQuerySchema } from '~~/shared/schemas/monitoring.schema'
import { monitoringService } from '~~/server/services/monitoring.service'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const query = monitoringListQuerySchema.parse(getQuery(event))
    return await monitoringService.list(query)
  }
  catch (error) {
    throw handleApiError(error)
  }
})
