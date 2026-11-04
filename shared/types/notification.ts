import type { NotificationCategory } from '~~/shared/schemas/notification.schema'

export interface NotificationDto {
  id: string
  category: NotificationCategory
  title: string
  body: string
  patientId: string | null
  patientName: string | null
  link: string | null
  isRead: boolean
  createdAt: string
  readAt: string | null
}

export interface NotificationListResponse {
  data: NotificationDto[]
  meta: { page: number, pageSize: number, total: number }
}

export interface NotificationStatsDto {
  unread: number
  total: number
}

export const notificationCategoryLabel: Record<NotificationCategory, string> = {
  pengingat: 'Pengingat Kontrol',
  jadwal: 'Perubahan Jadwal',
  sistem: 'Sistem',
}

export const notificationCategoryBadgeClass: Record<NotificationCategory, string> = {
  pengingat: 'bg-status-warning-bg text-status-warning',
  jadwal: 'bg-primary-surface text-primary',
  sistem: 'bg-status-info-bg text-status-info',
}

export const notificationCategoryDotClass: Record<NotificationCategory, string> = {
  pengingat: 'bg-status-warning',
  jadwal: 'bg-primary',
  sistem: 'bg-status-info',
}
