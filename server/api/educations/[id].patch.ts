import { z } from 'zod'
import { updateEducationSchema } from '~~/shared/schemas/education.schema'
import { ADMIN_ACCESS, STAFF_SCOPES } from '~~/shared/config/access'
import { handleApiError } from '~~/server/utils/errors'
import { educationService } from '~~/server/services/education.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireSession(event, { scopes: STAFF_SCOPES, accessLevels: ADMIN_ACCESS, action: 'mengubah materi edukasi' })
    const body = await readValidatedBody(event, data => updateEducationSchema.parse(data))
    const id = z.string().uuid('ID materi tidak valid').parse(getRouterParam(event, 'id'))
    return { data: await educationService.update(id, body) }
  } catch (error) {
    throw handleApiError(error)
  }
})
