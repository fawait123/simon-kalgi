import { createPatientSchema } from '~~/shared/schemas/patient.schema'
import { ADMIN_ACCESS, STAFF_SCOPES } from '~~/shared/config/access'
import { handleApiError } from '~~/server/utils/errors'
import { patientService } from '~~/server/services/patient.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireSession(event, { scopes: STAFF_SCOPES, accessLevels: ADMIN_ACCESS, action: 'menambah pasien' })
    const body = await readValidatedBody(event, (data) => createPatientSchema.parse(data))
    const patient = await patientService.create(body)
    setResponseStatus(event, 201)
    return { data: patient }
  } catch (error) {
    throw handleApiError(error)
  }
})
