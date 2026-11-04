import { notificationListQuerySchema } from '~~/shared/schemas/notification.schema'
import { notificationService } from '~~/server/services/notification.service'
import { PATIENT_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

// Letaknya di bawah prefix /api/patient-care/ agar ikut allow-list portal pasien di
// server/middleware/01.session-scope.ts tanpa mengubah middleware itu sama sekali.
export default defineEventHandler(async (event) => {
  try {
    const claims = await requireSession(event, { scopes: PATIENT_SCOPES, action: 'membuka notifikasi Anda' })

    const query = notificationListQuerySchema.parse(getQuery(event))
    return await notificationService.listForPatient(claims.sub, query)
  }
  catch (error) {
    throw handleApiError(error)
  }
})
