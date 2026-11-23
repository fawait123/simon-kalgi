import { createCareTaskSchema } from '~~/shared/schemas/care-task.schema'
import { STAFF_SCOPES } from '~~/shared/config/access'
import { handleApiError } from '~~/server/utils/errors'
import { careTaskService } from '~~/server/services/care-task.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireSession(event, { scopes: STAFF_SCOPES, action: 'menambah tugas perawatan pasien' })
    const body = await readValidatedBody(event, data => createCareTaskSchema.parse(data))
    const task = await careTaskService.create(body)
    setResponseStatus(event, 201)
    return { data: task }
  } catch (error) {
    throw handleApiError(error)
  }
})
