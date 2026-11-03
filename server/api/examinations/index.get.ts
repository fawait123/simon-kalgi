import { examinationListQuerySchema } from '~~/shared/schemas/examination.schema'
import { examinationService } from '~~/server/services/examination.service'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const query = examinationListQuerySchema.parse(getQuery(event))
    return await examinationService.list(query)
  }
  catch (error) {
    throw handleApiError(error)
  }
})
