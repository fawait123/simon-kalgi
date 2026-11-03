import { patientListQuerySchema } from '~~/shared/schemas/patient.schema'
import { handleApiError } from '~~/server/utils/errors'
import { patientService } from '~~/server/services/patient.service'

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (data) => patientListQuerySchema.parse(data))
  try {
    return await patientService.list(query)
  } catch (error) {
    throw handleApiError(error)
  }
})
