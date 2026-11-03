import { z } from 'zod'
import { createApiError, handleApiError } from '~~/server/utils/errors'
import { healthWorkerService } from '~~/server/services/health-worker.service'

export default defineEventHandler(async (event) => {
  try {
    const id = z.string().uuid('ID petugas tidak valid').parse(getRouterParam(event, 'id'))
    const worker = await healthWorkerService.remove(id)
    if (!worker) throw createApiError(404, 'Petugas tidak ditemukan.')
    return { data: { id } }
  } catch (error) {
    throw handleApiError(error)
  }
})
