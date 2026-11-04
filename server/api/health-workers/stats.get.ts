import { ADMIN_ACCESS, STAFF_SCOPES } from '~~/shared/config/access'
import { healthWorkerService } from '~~/server/services/health-worker.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireSession(event, { scopes: STAFF_SCOPES, accessLevels: ADMIN_ACCESS, action: 'membuka rekap petugas' })
  return { data: await healthWorkerService.stats() }
})
