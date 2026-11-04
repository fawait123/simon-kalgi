import { ADMIN_ACCESS, STAFF_SCOPES } from '~~/shared/config/access'
import { handleApiError } from '~~/server/utils/errors'
import { patientService } from '~~/server/services/patient.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireSession(event, { scopes: STAFF_SCOPES, accessLevels: ADMIN_ACCESS, action: 'menambah pasien' })
    return { data: await patientService.nextRecordNo() }
  } catch (error) {
    throw handleApiError(error)
  }
})
