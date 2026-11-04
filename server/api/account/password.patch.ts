import { changeAccountPasswordSchema } from '~~/shared/schemas/account.schema'
import { accountService } from '~~/server/services/account.service'
import { STAFF_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await requireSession(event, { scopes: STAFF_SCOPES, action: 'mengganti kata sandi' })

    const body = changeAccountPasswordSchema.parse(await readBody(event))
    return { data: await accountService.changePassword(claims.sub, body) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
