import { updateAccountProfileSchema } from '~~/shared/schemas/account.schema'
import { accountService } from '~~/server/services/account.service'
import { STAFF_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await requireSession(event, { scopes: STAFF_SCOPES, action: 'menyimpan perubahan akun' })

    const body = updateAccountProfileSchema.parse(await readBody(event))
    return { data: await accountService.updateProfile(claims.sub, body) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
