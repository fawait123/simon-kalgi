import { z } from 'zod'
import { monitoringService } from '~~/server/services/monitoring.service'
import { STAFF_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await requireSession(event, { scopes: STAFF_SCOPES, action: 'mengonfirmasi jadwal kontrol' })

    const patientId = z.string().uuid('ID pasien tidak valid').parse(getRouterParam(event, 'patientId'))
    return { data: await monitoringService.confirm(patientId) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
