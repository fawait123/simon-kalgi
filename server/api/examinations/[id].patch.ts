import { z } from 'zod'
import { updateExaminationSchema } from '~~/shared/schemas/examination.schema'
import { examinationService } from '~~/server/services/examination.service'
import { readSessionClaims } from '~~/server/utils/auth'
import { createApiError, handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await readSessionClaims(event)
    if (!claims)
      throw createApiError(401, 'Sesi berakhir. Masuk kembali untuk menyimpan pemeriksaan.')

    const body = updateExaminationSchema.parse(await readBody(event))
    const id = z.string().uuid('ID pemeriksaan tidak valid').parse(getRouterParam(event, 'id'))
    const examination = await examinationService.update(id, {
      ...body,
      examinerId: claims.sub,
      examinerName: claims.fullName,
    })
    if (!examination)
      throw createApiError(404, 'Pemeriksaan tidak ditemukan.')
    return { data: examination }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
