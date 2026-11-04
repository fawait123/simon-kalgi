import { notificationListQuerySchema } from '~~/shared/schemas/notification.schema'
import { notificationService } from '~~/server/services/notification.service'
import { STAFF_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await requireSession(event, { scopes: STAFF_SCOPES, action: 'membuka notifikasi' })

    const query = notificationListQuerySchema.parse(getQuery(event))
    return await notificationService.list(claims.sub, query)
  }
  catch (error) {
    throw handleApiError(error)
  }
})
