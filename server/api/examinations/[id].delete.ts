import { z } from 'zod'
import { examinationService } from '~~/server/services/examination.service'
import { readSessionClaims } from '~~/server/utils/auth'
import { createApiError, handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await readSessionClaims(event)
    if (!claims)
      throw createApiError(401, 'Sesi berakhir. Masuk kembali untuk menghapus rekam medis.')

    const id = z.string().uuid('ID pemeriksaan tidak valid').parse(getRouterParam(event, 'id'))
    const deleted = await examinationService.remove(id)
    return { data: { id: deleted.id } }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
