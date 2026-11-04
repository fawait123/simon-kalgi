import { scheduleMonitoringSchema } from '~~/shared/schemas/monitoring.schema'
import { monitoringService } from '~~/server/services/monitoring.service'
import { STAFF_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { createApiError, handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await requireSession(event, { scopes: STAFF_SCOPES, action: 'menjadwalkan pemantauan' })

    const body = scheduleMonitoringSchema.parse(await readBody(event))
    const examiner = body.clinician.trim()
    if (examiner.localeCompare(claims.fullName.trim(), 'id') !== 0) {
      throw createApiError(403, 'Dokter pemeriksa harus tenaga medis yang sedang login.')
    }

    setResponseStatus(event, 201)
    const scheduled = await monitoringService.schedule(body, {
      userId: claims.sub,
      fullName: claims.fullName,
    })
    return { data: scheduled }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
