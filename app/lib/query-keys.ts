import type { HealthWorkerListQuery } from '~~/shared/schemas/health-worker.schema'
import type { PatientListQuery } from '~~/shared/schemas/patient.schema'

export const healthWorkerKeys = {
  all: ['health-workers'] as const,
  lists: () => [...healthWorkerKeys.all, 'list'] as const,
  list: (params: HealthWorkerListQuery) => [...healthWorkerKeys.lists(), params] as const,
  details: () => [...healthWorkerKeys.all, 'detail'] as const,
  detail: (id: string) => [...healthWorkerKeys.details(), id] as const,
  stats: () => [...healthWorkerKeys.all, 'stats'] as const,
}

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (params: PatientListQuery) => [...patientKeys.lists(), params] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
  nextRecordNo: () => [...patientKeys.all, 'next-record-no'] as const,
}
