import { dashboardService } from '~~/server/services/dashboard.service'
import { STAFF_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await requireSession(event, { scopes: STAFF_SCOPES, action: 'memuat dashboard' })

    return { data: await dashboardService.summary() }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
