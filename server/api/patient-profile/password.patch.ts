import { changePatientPasswordSchema } from '~~/shared/schemas/patient-profile.schema'
import { patientProfileService } from '~~/server/services/patient-profile.service'
import { PATIENT_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await requireSession(event, { scopes: PATIENT_SCOPES, action: 'mengubah kata sandi' })

    const body = await readValidatedBody(event, changePatientPasswordSchema.parse)
    return { data: await patientProfileService.changePassword(claims.sub, body) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
