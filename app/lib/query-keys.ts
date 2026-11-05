import type { ExaminationListQueryInput } from '~~/shared/schemas/examination.schema'
import type { EducationListQuery, PatientEducationQuery } from '~~/shared/schemas/education.schema'
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

export const patientCareKeys = {
  all: ['patient-care'] as const,
  checklist: () => [...patientCareKeys.all, 'checklist'] as const,
}

export const patientProfileKeys = {
  all: ['patient-profile'] as const,
  profile: () => [...patientProfileKeys.all, 'profile'] as const,
}

// Root-nya sengaja tidak dinest di bawah patientCareKeys: invalidasi setelah centang tugas
// checklist tidak boleh ikut menarik ulang riwayat pemeriksaan yang murni baca-saja.
export const patientRecordKeys = {
  all: ['patient-record'] as const,
  sessions: () => [...patientRecordKeys.all, 'sessions'] as const,
  details: () => [...patientRecordKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientRecordKeys.details(), id] as const,
}

// Root-nya sengaja tidak dinest di bawah patientCareKeys: invalidasi setelah centang checklist
// akan ikut menarik ulang feed notifikasi bila keduanya berbagi prefix.
export const patientNotificationKeys = {
  all: ['patient-notifications'] as const,
  lists: () => [...patientNotificationKeys.all, 'list'] as const,
  list: (params: NotificationListQuery) => [...patientNotificationKeys.lists(), params] as const,
  stats: () => [...patientNotificationKeys.all, 'stats'] as const,
}

export const educationKeys = {
  all: ['educations'] as const,
  lists: () => [...educationKeys.all, 'list'] as const,
  list: (params: EducationListQuery) => [...educationKeys.lists(), params] as const,
  details: () => [...educationKeys.all, 'detail'] as const,
  detail: (id: string) => [...educationKeys.details(), id] as const,
  stats: () => [...educationKeys.all, 'stats'] as const,
}

// Root-nya sengaja tidak dinest di bawah educationKeys: invalidasi CRUD admin tidak boleh
// menarik ulang feed edukasi yang dibaca pasien.
export const patientEducationKeys = {
  all: ['patient-educations'] as const,
  lists: () => [...patientEducationKeys.all, 'list'] as const,
  list: (params: PatientEducationQuery) => [...patientEducationKeys.lists(), params] as const,
  details: () => [...patientEducationKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientEducationKeys.details(), id] as const,
}
