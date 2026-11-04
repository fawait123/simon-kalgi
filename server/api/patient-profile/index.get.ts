import { patientProfileService } from '~~/server/services/patient-profile.service'
import { PATIENT_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await requireSession(event, { scopes: PATIENT_SCOPES, action: 'membuka profil Anda' })
    return { data: await patientProfileService.getProfile(claims.sub) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
