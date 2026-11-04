import { healthWorkerListQuerySchema } from '~~/shared/schemas/health-worker.schema'
import { STAFF_SCOPES } from '~~/shared/config/access'
import { handleApiError } from '~~/server/utils/errors'
import { healthWorkerService } from '~~/server/services/health-worker.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (data) => healthWorkerListQuerySchema.parse(data))
  try {
    // Sengaja tanpa `accessLevels`: /rekam-pemeriksaan memakai daftar ini sebagai filter pemeriksa
    // untuk semua petugas.
    await requireSession(event, { scopes: STAFF_SCOPES, action: 'membuka daftar petugas' })
    return await healthWorkerService.list(query)
  } catch (error) {
    throw handleApiError(error)
  }
})
