import { z } from 'zod'
import { updateHealthWorkerSchema } from '~~/shared/schemas/health-worker.schema'
import { createApiError, handleApiError } from '~~/server/utils/errors'
import { healthWorkerService } from '~~/server/services/health-worker.service'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (data) => updateHealthWorkerSchema.parse(data))
  try {
    const id = z.string().uuid('ID petugas tidak valid').parse(getRouterParam(event, 'id'))
    const worker = await healthWorkerService.update(id, body)
    if (!worker) throw createApiError(404, 'Petugas tidak ditemukan.')
    return { data: worker }
  } catch (error) {
    throw handleApiError(error)
  }
})
