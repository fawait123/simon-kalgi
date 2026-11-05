import { z } from 'zod'
import { ADMIN_ACCESS, STAFF_SCOPES } from '~~/shared/config/access'
import { handleApiError } from '~~/server/utils/errors'
import { educationService } from '~~/server/services/education.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireSession(event, { scopes: STAFF_SCOPES, accessLevels: ADMIN_ACCESS, action: 'melihat detail materi edukasi' })
    const id = z.string().uuid('ID materi tidak valid').parse(getRouterParam(event, 'id'))
    return { data: await educationService.getById(id) }
  } catch (error) {
    throw handleApiError(error)
  }
})
