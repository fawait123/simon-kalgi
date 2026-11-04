import type { ExaminationListQueryInput } from '~~/shared/schemas/examination.schema'
import type { HealthWorkerListQuery } from '~~/shared/schemas/health-worker.schema'
import type { MonitoringListQuery, MonitoringTrendRange } from '~~/shared/schemas/monitoring.schema'
import type { NotificationListQuery } from '~~/shared/schemas/notification.schema'
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

export const examinationKeys = {
  all: ['examinations'] as const,
  lists: () => [...examinationKeys.all, 'list'] as const,
  list: (params: ExaminationListQueryInput) => [...examinationKeys.lists(), params] as const,
  details: () => [...examinationKeys.all, 'detail'] as const,
  detail: (id: string) => [...examinationKeys.details(), id] as const,
  latest: () => [...examinationKeys.all, 'latest'] as const,
  latestFor: (patientId: string) => [...examinationKeys.latest(), patientId] as const,
  stats: () => [...examinationKeys.all, 'stats'] as const,
}

export const monitoringKeys = {
  all: ['monitoring'] as const,
  lists: () => [...monitoringKeys.all, 'list'] as const,
  list: (params: MonitoringListQuery) => [...monitoringKeys.lists(), params] as const,
  details: () => [...monitoringKeys.all, 'detail'] as const,
  detail: (patientId: string) => [...monitoringKeys.details(), patientId] as const,
  stats: () => [...monitoringKeys.all, 'stats'] as const,
  trends: () => [...monitoringKeys.all, 'trend'] as const,
  trend: (range: MonitoringTrendRange) => [...monitoringKeys.trends(), range] as const,
}

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: NotificationListQuery) => [...notificationKeys.lists(), params] as const,
  stats: () => [...notificationKeys.all, 'stats'] as const,
}

export const accountKeys = {
  all: ['account'] as const,
  profile: () => [...accountKeys.all, 'profile'] as const,
  stats: () => [...accountKeys.all, 'stats'] as const,
}

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
}
