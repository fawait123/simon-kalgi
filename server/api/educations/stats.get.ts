import { ADMIN_ACCESS, STAFF_SCOPES } from '~~/shared/config/access'
import { handleApiError } from '~~/server/utils/errors'
import { educationService } from '~~/server/services/education.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireSession(event, { scopes: STAFF_SCOPES, accessLevels: ADMIN_ACCESS, action: 'membuka statistik materi edukasi' })
    return { data: await educationService.stats() }
  } catch (error) {
    throw handleApiError(error)
  }
})
