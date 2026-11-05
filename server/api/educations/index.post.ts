import { createEducationSchema } from '~~/shared/schemas/education.schema'
import { ADMIN_ACCESS, STAFF_SCOPES } from '~~/shared/config/access'
import { handleApiError } from '~~/server/utils/errors'
import { educationService } from '~~/server/services/education.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireSession(event, { scopes: STAFF_SCOPES, accessLevels: ADMIN_ACCESS, action: 'menambah materi edukasi' })
    const body = await readValidatedBody(event, data => createEducationSchema.parse(data))
    const article = await educationService.create(body)
    setResponseStatus(event, 201)
    return { data: article }
  } catch (error) {
    throw handleApiError(error)
  }
})
