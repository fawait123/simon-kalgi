import { accountService } from '~~/server/services/account.service'
import { readSessionClaims } from '~~/server/utils/auth'
import { createApiError, handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await readSessionClaims(event)
    if (!claims)
      throw createApiError(401, 'Sesi berakhir. Masuk kembali untuk menyimpan perubahan akun.')

    return { data: await accountService.getStats(claims.sub) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
