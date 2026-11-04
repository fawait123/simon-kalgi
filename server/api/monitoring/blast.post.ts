import { monitoringService } from '~~/server/services/monitoring.service'
import { STAFF_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await requireSession(event, { scopes: STAFF_SCOPES, action: 'mengirim pengingat massal' })

    setResponseStatus(event, 201)
    return { data: await monitoringService.blast({ userId: claims.sub, fullName: claims.fullName }) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
