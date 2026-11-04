import { notificationListQuerySchema } from '~~/shared/schemas/notification.schema'
import { notificationService } from '~~/server/services/notification.service'
import { readSessionClaims } from '~~/server/utils/auth'
import { createApiError, handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await readSessionClaims(event)
    if (!claims)
      throw createApiError(401, 'Sesi berakhir. Masuk kembali untuk membuka notifikasi.')

    const query = notificationListQuerySchema.parse(getQuery(event))
    return await notificationService.list(claims.sub, query)
  }
  catch (error) {
    throw handleApiError(error)
  }
})
