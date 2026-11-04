import { notificationService } from '~~/server/services/notification.service'
import { PATIENT_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await requireSession(event, { scopes: PATIENT_SCOPES, action: 'menandai notifikasi Anda' })

    return { data: await notificationService.markAllReadForPatient(claims.sub) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
