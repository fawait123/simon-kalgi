import { createHealthWorkerSchema } from '~~/shared/schemas/health-worker.schema'
import { handleApiError } from '~~/server/utils/errors'
import { healthWorkerService } from '~~/server/services/health-worker.service'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (data) => createHealthWorkerSchema.parse(data))
  try {
    const worker = await healthWorkerService.create(body)
    setResponseStatus(event, 201)
    return { data: worker }
  } catch (error) {
    throw handleApiError(error)
  }
})
