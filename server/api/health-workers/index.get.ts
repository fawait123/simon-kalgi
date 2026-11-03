import { healthWorkerListQuerySchema } from '~~/shared/schemas/health-worker.schema'
import { handleApiError } from '~~/server/utils/errors'
import { healthWorkerService } from '~~/server/services/health-worker.service'

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (data) => healthWorkerListQuerySchema.parse(data))
  try {
    return await healthWorkerService.list(query)
  } catch (error) {
    throw handleApiError(error)
  }
})
