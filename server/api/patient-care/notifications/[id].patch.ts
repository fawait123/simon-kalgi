import { z } from 'zod'
import { notificationService } from '~~/server/services/notification.service'
import { PATIENT_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await requireSession(event, { scopes: PATIENT_SCOPES, action: 'menandai notifikasi Anda' })

    const id = z.string().uuid('ID notifikasi tidak valid').parse(getRouterParam(event, 'id'))
    return { data: await notificationService.markReadForPatient(claims.sub, id) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
