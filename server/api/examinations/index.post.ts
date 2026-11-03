import { createExaminationSchema } from '~~/shared/schemas/examination.schema'
import { examinationService } from '~~/server/services/examination.service'
import { readSessionClaims } from '~~/server/utils/auth'
import { createApiError, handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await readSessionClaims(event)
    if (!claims)
      throw createApiError(401, 'Sesi berakhir. Masuk kembali untuk menyimpan pemeriksaan.')

    const body = createExaminationSchema.parse(await readBody(event))
    setResponseStatus(event, 201)
    const examination = await examinationService.create({
      ...body,
      examinerId: claims.sub,
      examinerName: claims.fullName,
    })
    return { data: examination }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
