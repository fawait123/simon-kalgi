import type { HealthWorkerListQuery } from '~~/shared/schemas/health-worker.schema'

export const healthWorkerKeys = {
  all: ['health-workers'] as const,
  lists: () => [...healthWorkerKeys.all, 'list'] as const,
  list: (params: HealthWorkerListQuery) => [...healthWorkerKeys.lists(), params] as const,
  details: () => [...healthWorkerKeys.all, 'detail'] as const,
  detail: (id: string) => [...healthWorkerKeys.details(), id] as const,
  stats: () => [...healthWorkerKeys.all, 'stats'] as const,
}
