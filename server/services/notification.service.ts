import type { Prisma } from '@prisma/client'
import type { NotificationListQuery, NotificationReadFilter } from '~~/shared/schemas/notification.schema'
import type { NotificationDto, NotificationListResponse, NotificationStatsDto } from '~~/shared/types/notification'
import type { NotificationPageRecord } from '~~/server/repositories/notification.repository'
import { notificationRepository } from '~~/server/repositories/notification.repository'
import { createApiError } from '~~/server/utils/errors'

const BLAST_DEDUPE_WINDOW_MS = 10 * 60_000

const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

function utcShortDate(value: Date | null) {
  return value ? shortDateFormatter.format(value).replace('.', '') : null
}

function mapNotification(row: NotificationPageRecord): NotificationDto {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    body: row.body,
    patientId: row.patientId,
    patientName: row.patient?.fullName ?? null,
    link: row.link,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
    readAt: row.readAt ? row.readAt.toISOString() : null,
  }
}

function readFilterWhere(filter: NotificationReadFilter): Prisma.NotificationWhereInput {
  if (filter === 'unread')
    return { isRead: false }
  if (filter === 'read')
    return { isRead: true }
  return {}
}

export interface NotifyReminderInput {
  recipientId: string
  patientId: string
  patientName: string
  scheduledVisitAt: Date | null
}

export interface NotifyScheduleInput {
  recipientId: string
  patientId: string
  patientName: string
  scheduledVisitAt: Date
  withReminder: boolean
}

export interface NotifyBlastInput {
  recipientId: string
  sent: number
}

export const notificationService = {
  async list(recipientId: string, query: NotificationListQuery): Promise<NotificationListResponse> {
    const skip = (query.page - 1) * query.pageSize
    const [rows, total] = await notificationRepository.findPage(
      { recipientId, ...readFilterWhere(query.filter) },
      skip,
      query.pageSize,
    )

    return {
      data: rows.map(mapNotification),
      meta: { page: query.page, pageSize: query.pageSize, total },
    }
  },

  async stats(recipientId: string): Promise<NotificationStatsDto> {
    const groups = await notificationRepository.countByRead(recipientId)
    const total = groups.reduce((sum, group) => sum + group._count._all, 0)
    const unread = groups.find(group => group.isRead === false)?._count._all ?? 0

    return { unread, total }
  },

  async detail(recipientId: string, id: string): Promise<NotificationDto> {
    const row = await notificationRepository.findById(id, recipientId)
    if (!row)
      throw createApiError(404, 'Notifikasi tidak ditemukan.')

    return mapNotification(row)
  },

  async markRead(recipientId: string, id: string): Promise<NotificationDto> {
    const updated = await notificationRepository.markRead(id, recipientId, new Date())
    if (updated.count === 0) {
      const existing = await notificationRepository.findById(id, recipientId)
      if (!existing)
        throw createApiError(404, 'Notifikasi tidak ditemukan.')
      return mapNotification(existing)
    }

    return this.detail(recipientId, id)
  },

  async markAllRead(recipientId: string) {
    const result = await notificationRepository.markAllRead(recipientId, new Date())
    return { updated: result.count }
  },

  async notifyReminder(input: NotifyReminderInput) {
    const scheduled = utcShortDate(input.scheduledVisitAt)
    return notificationRepository.create({
      recipientId: input.recipientId,
      category: 'pengingat',
      title: `Pengingat kontrol dikirim: ${input.patientName}`,
      body: scheduled
        ? `Pengingat in-app terkirim untuk jadwal kontrol ${scheduled}. Pasien diminta mengonfirmasi kehadiran.`
        : `Pengingat in-app terkirim untuk ${input.patientName}. Jadwal kontrol belum ditetapkan.`,
      patientId: input.patientId,
      link: '/monitoring',
    })
  },

  async notifySchedule(input: NotifyScheduleInput) {
    const scheduled = utcShortDate(input.scheduledVisitAt)
    return notificationRepository.create({
      recipientId: input.recipientId,
      category: 'jadwal',
      title: `Jadwal kontrol ${input.patientName} diperbarui`,
      body: `${scheduled} · ${input.withReminder
        ? 'pengingat in-app H-1 diaktifkan'
        : 'tanpa pengingat in-app'}. Rencana kontrol sebelumnya pada rekam medis pasien otomatis digantikan.`,
      patientId: input.patientId,
      link: '/monitoring',
    })
  },

  async notifyBlast(input: NotifyBlastInput) {
    const title = `Blast pengingat in-app: ${input.sent} pasien`
    const recent = await notificationRepository.findRecent(
      input.recipientId,
      title,
      new Date(Date.now() - BLAST_DEDUPE_WINDOW_MS),
    )
    if (recent)
      return null

    return notificationRepository.create({
      recipientId: input.recipientId,
      category: 'pengingat',
      title,
      body: `Pengingat kontrol dikirim ke ${input.sent} pasien berstatus terlambat dan kritis melalui kotak masuk in-app pasien.`,
      link: '/monitoring',
    })
  },
}
