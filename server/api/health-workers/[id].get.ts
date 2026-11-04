import { z } from 'zod'
import { ADMIN_ACCESS, STAFF_SCOPES } from '~~/shared/config/access'
import { createApiError, handleApiError } from '~~/server/utils/errors'
import { healthWorkerService } from '~~/server/services/health-worker.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireSession(event, { scopes: STAFF_SCOPES, accessLevels: ADMIN_ACCESS, action: 'membuka detail petugas' })
    const id = z.string().uuid('ID petugas tidak valid').parse(getRouterParam(event, 'id'))
    const worker = await healthWorkerService.getById(id)
    if (!worker) throw createApiError(404, 'Petugas tidak ditemukan.')
    return { data: worker }
  } catch (error) {
    throw handleApiError(error)
  }
})
