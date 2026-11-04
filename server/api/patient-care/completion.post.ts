import { toggleCareTaskSchema } from '~~/shared/schemas/patient-care.schema'
import { patientCareService } from '~~/server/services/patient-care.service'
import { PATIENT_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await requireSession(event, { scopes: PATIENT_SCOPES, action: 'menyimpan checklist kepatuhan' })
    const body = await readValidatedBody(event, (data: unknown) => toggleCareTaskSchema.parse(data))
    return { data: await patientCareService.toggle(claims.sub, body) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
