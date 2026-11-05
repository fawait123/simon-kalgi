import { educationListQuerySchema } from '~~/shared/schemas/education.schema'
import { ADMIN_ACCESS, STAFF_SCOPES } from '~~/shared/config/access'
import { handleApiError } from '~~/server/utils/errors'
import { educationService } from '~~/server/services/education.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, data => educationListQuerySchema.parse(data))
  try {
    await requireSession(event, { scopes: STAFF_SCOPES, accessLevels: ADMIN_ACCESS, action: 'membuka daftar materi edukasi' })
    return await educationService.list(query)
  } catch (error) {
    throw handleApiError(error)
  }
})
