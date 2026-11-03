import { handleApiError } from '~~/server/utils/errors'
import { patientService } from '~~/server/services/patient.service'

export default defineEventHandler(async () => {
  try {
    return { data: await patientService.nextRecordNo() }
  } catch (error) {
    throw handleApiError(error)
  }
})
