import { healthWorkerService } from '~~/server/services/health-worker.service'

export default defineEventHandler(async () => {
  return { data: await healthWorkerService.stats() }
})
