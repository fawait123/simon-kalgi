import { createHealthWorkerSchema } from '~~/shared/schemas/health-worker.schema'
import { ADMIN_ACCESS, STAFF_SCOPES } from '~~/shared/config/access'
import { handleApiError } from '~~/server/utils/errors'
import { healthWorkerService } from '~~/server/services/health-worker.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireSession(event, { scopes: STAFF_SCOPES, accessLevels: ADMIN_ACCESS, action: 'menambah petugas' })
    const body = await readValidatedBody(event, (data) => createHealthWorkerSchema.parse(data))
    const worker = await healthWorkerService.create(body)
    setResponseStatus(event, 201)
    return { data: worker }
  } catch (error) {
    throw handleApiError(error)
  }
})
