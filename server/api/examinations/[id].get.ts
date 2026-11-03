import { z } from 'zod'
import { createApiError, handleApiError } from '~~/server/utils/errors'
import { examinationService } from '~~/server/services/examination.service'

export default defineEventHandler(async (event) => {
  try {
    const id = z.string().uuid('ID pemeriksaan tidak valid').parse(getRouterParam(event, 'id'))
    const examination = await examinationService.getById(id)
    if (!examination)
      throw createApiError(404, 'Pemeriksaan tidak ditemukan.')
    return { data: examination }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
