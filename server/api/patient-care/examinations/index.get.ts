import { patientRecordService } from '~~/server/services/patient-record.service'
import { PATIENT_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

// Prefix /api/patient-care/ sudah ada di allow-list portal pasien
// (server/middleware/01.session-scope.ts), jadi rute baru ini tidak menuntut perubahan middleware.
export default defineEventHandler(async (event) => {
  try {
    const claims = await requireSession(event, {
      scopes: PATIENT_SCOPES,
      action: 'membuka hasil pemeriksaan Anda',
    })

    return await patientRecordService.sessions(claims.sub)
  }
  catch (error) {
    throw handleApiError(error)
  }
})
