import { z } from 'zod'
import { notificationService } from '~~/server/services/notification.service'
import { readSessionClaims } from '~~/server/utils/auth'
import { createApiError, handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await readSessionClaims(event)
    if (!claims)
      throw createApiError(401, 'Sesi berakhir. Masuk kembali untuk membaca notifikasi.')

    const id = z.string().uuid('ID notifikasi tidak valid').parse(getRouterParam(event, 'id'))
    return { data: await notificationService.detail(claims.sub, id) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
