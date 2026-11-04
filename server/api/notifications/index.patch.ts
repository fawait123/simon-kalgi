import { notificationService } from '~~/server/services/notification.service'
import { STAFF_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await requireSession(event, { scopes: STAFF_SCOPES, action: 'memperbarui notifikasi' })

    return { data: await notificationService.markAllRead(claims.sub) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
