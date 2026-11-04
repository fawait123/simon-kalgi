import { patientCareService } from '~~/server/services/patient-care.service'
import { PATIENT_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await requireSession(event, { scopes: PATIENT_SCOPES, action: 'membuka checklist kepatuhan' })
    return { data: await patientCareService.checklist(claims.sub) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
