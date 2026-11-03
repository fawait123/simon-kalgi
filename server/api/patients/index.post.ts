import { createPatientSchema } from '~~/shared/schemas/patient.schema'
import { handleApiError } from '~~/server/utils/errors'
import { patientService } from '~~/server/services/patient.service'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (data) => createPatientSchema.parse(data))
  try {
    const patient = await patientService.create(body)
    setResponseStatus(event, 201)
    return { data: patient }
  } catch (error) {
    throw handleApiError(error)
  }
})
