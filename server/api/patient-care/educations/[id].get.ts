import { z } from 'zod'
import { PATIENT_SCOPES } from '~~/shared/config/access'
import { handleApiError } from '~~/server/utils/errors'
import { patientEducationService } from '~~/server/services/education.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireSession(event, { scopes: PATIENT_SCOPES, action: 'membaca materi edukasi' })
    const id = z.string().uuid('ID materi tidak valid').parse(getRouterParam(event, 'id'))
    return { data: await patientEducationService.detail(id) }
  } catch (error) {
    throw handleApiError(error)
  }
})
