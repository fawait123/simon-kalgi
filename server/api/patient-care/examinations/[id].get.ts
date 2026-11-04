import { z } from 'zod'
import { patientRecordService } from '~~/server/services/patient-record.service'
import { PATIENT_SCOPES } from '~~/shared/config/access'
import { requireSession } from '~~/server/utils/auth'
import { handleApiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const claims = await requireSession(event, {
      scopes: PATIENT_SCOPES,
      action: 'membuka hasil pemeriksaan Anda',
    })

    const id = z.string().uuid('ID pemeriksaan tidak valid').parse(getRouterParam(event, 'id'))
    return { data: await patientRecordService.detail(claims.sub, id) }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
