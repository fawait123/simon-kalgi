import { patientEducationQuerySchema } from '~~/shared/schemas/education.schema'
import { PATIENT_SCOPES } from '~~/shared/config/access'
import { handleApiError } from '~~/server/utils/errors'
import { patientEducationService } from '~~/server/services/education.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, data => patientEducationQuerySchema.parse(data))
  try {
    await requireSession(event, { scopes: PATIENT_SCOPES, action: 'membuka materi edukasi' })
    return await patientEducationService.list(query)
  } catch (error) {
    throw handleApiError(error)
  }
})
