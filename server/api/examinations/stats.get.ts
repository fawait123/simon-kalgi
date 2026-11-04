import { examinationService } from '~~/server/services/examination.service'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async () => {
  try {
    return { data: await examinationService.stats() }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
