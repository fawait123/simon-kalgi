import { dashboardService } from '~~/server/services/dashboard.service'
import { readSessionClaims } from '~~/server/utils/auth'
import { createApiError, handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await readSessionClaims(event)
    if (!claims)
      throw createApiError(401, 'Sesi berakhir. Masuk kembali untuk memuat dashboard.')

    return { data: await dashboardService.summary() }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
