import { z } from 'zod'
import { updateCareTaskSchema } from '~~/shared/schemas/care-task.schema'
import { STAFF_SCOPES } from '~~/shared/config/access'
import { handleApiError } from '~~/server/utils/errors'
import { careTaskService } from '~~/server/services/care-task.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireSession(event, { scopes: STAFF_SCOPES, action: 'mengubah tugas perawatan pasien' })
    const body = await readValidatedBody(event, data => updateCareTaskSchema.parse(data))
    const id = z.string().uuid('ID tugas perawatan tidak valid').parse(getRouterParam(event, 'id'))
    return { data: await careTaskService.update(id, body) }
  } catch (error) {
    throw handleApiError(error)
  }
})
