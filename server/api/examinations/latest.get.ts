import { z } from 'zod'
import { examinationService } from '~~/server/services/examination.service'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const query = z.object({ patientId: z.string().uuid('Pasien wajib dipilih') }).parse(getQuery(event))
    return { data: await examinationService.getLatestByPatient(query.patientId) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
