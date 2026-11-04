import { z } from 'zod'
import { notificationService } from '~~/server/services/notification.service'
import { STAFF_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await requireSession(event, { scopes: STAFF_SCOPES, action: 'membaca notifikasi' })

    const id = z.string().uuid('ID notifikasi tidak valid').parse(getRouterParam(event, 'id'))
    return { data: await notificationService.detail(claims.sub, id) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
