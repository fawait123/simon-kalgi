import type { Prisma } from '@prisma/client'
import type { NotificationListQuery, NotificationReadFilter } from '~~/shared/schemas/notification.schema'
import type { NotificationDto, NotificationListResponse, NotificationStatsDto } from '~~/shared/types/notification'
import type { NotificationInboxOwner, NotificationPageRecord } from '~~/server/repositories/notification.repository'
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

export interface NotifyPatientReminderInput {
  patientId: string
  scheduledVisitAt: Date | null
}

export interface NotifyPatientScheduleInput {
  patientId: string
  scheduledVisitAt: Date
  purpose: string
  withReminder: boolean
}

async function listBy(owner: NotificationInboxOwner, query: NotificationListQuery): Promise<NotificationListResponse> {
  const skip = (query.page - 1) * query.pageSize
  const [rows, total] = await notificationRepository.findPage(
    { ...owner, ...readFilterWhere(query.filter) },
    skip,
    query.pageSize,
  )

  return {
    data: rows.map(mapNotification),
    meta: { page: query.page, pageSize: query.pageSize, total },
  }
}

async function statsBy(owner: NotificationInboxOwner): Promise<NotificationStatsDto> {
  const groups = await notificationRepository.countByRead(owner)
  const total = groups.reduce((sum, group) => sum + group._count._all, 0)
  const unread = groups.find(group => group.isRead === false)?._count._all ?? 0

  return { unread, total }
}

async function detailBy(owner: NotificationInboxOwner, id: string): Promise<NotificationDto> {
  const row = await notificationRepository.findById(id, owner)
  if (!row)
    throw createApiError(404, 'Notifikasi tidak ditemukan.')

  return mapNotification(row)
}

async function markReadBy(owner: NotificationInboxOwner, id: string): Promise<NotificationDto> {
  const updated = await notificationRepository.markRead(id, owner, new Date())
  if (updated.count === 0) {
    const existing = await notificationRepository.findById(id, owner)
    if (!existing)
      throw createApiError(404, 'Notifikasi tidak ditemukan.')
    return mapNotification(existing)
  }

  return detailBy(owner, id)
}

async function markAllReadBy(owner: NotificationInboxOwner) {
  const result = await notificationRepository.markAllRead(owner, new Date())
  return { updated: result.count }
}

export const notificationService = {
  async list(recipientId: string, query: NotificationListQuery) {
    return listBy({ recipientId }, query)
  },

  async stats(recipientId: string) {
    return statsBy({ recipientId })
  },

  async detail(recipientId: string, id: string) {
    return detailBy({ recipientId }, id)
  },

  async markRead(recipientId: string, id: string) {
    return markReadBy({ recipientId }, id)
  },

  async markAllRead(recipientId: string) {
    return markAllReadBy({ recipientId })
  },

  async listForPatient(patientId: string, query: NotificationListQuery) {
    return listBy({ recipientPatientId: patientId }, query)
  },

  async statsForPatient(patientId: string) {
    return statsBy({ recipientPatientId: patientId })
  },

  async markReadForPatient(patientId: string, id: string) {
    return markReadBy({ recipientPatientId: patientId }, id)
  },

  async markAllReadForPatient(patientId: string) {
    return markAllReadBy({ recipientPatientId: patientId })
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
      link: '/admin/monitoring',
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
      link: '/admin/monitoring',
    })
  },

  async notifyBlast(input: NotifyBlastInput) {
    const title = `Blast pengingat in-app: ${input.sent} pasien`
    const recent = await notificationRepository.findRecent(
      { recipientId: input.recipientId },
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
      link: '/admin/monitoring',
    })
  },

  async notifyPatientReminder(input: NotifyPatientReminderInput) {
    const scheduled = utcShortDate(input.scheduledVisitAt)
    return notificationRepository.create({
      recipientPatientId: input.patientId,
      category: 'pengingat',
      title: 'Klinik mengingatkan jadwal kontrol Anda',
      body: scheduled
        ? `Pengingat untuk kontrol ${scheduled}. Konfirmasi kehadiran Anda lewat portal agar perawat dapat menyiapkan ruang tindakan.`
        : 'Belum ada jadwal kontrol pada rekam medis Anda. Jalankan checklist perawatan mandiri selagi menunggu penjadwalan.',
      link: '/pasien/dashboard',
    })
  },

  async notifyPatientSchedule(input: NotifyPatientScheduleInput) {
    const scheduled = utcShortDate(input.scheduledVisitAt)
    return notificationRepository.create({
      recipientPatientId: input.patientId,
      category: 'jadwal',
      title: `Jadwal kontrol Anda diperbarui: ${scheduled}`,
      body: `${input.purpose} · ${input.withReminder
        ? 'pengingat H-1 diaktifkan'
        : 'tanpa pengingat'}. Lengkapi checklist perawatan mandiri sebelum hari kontrol agar penilaian klinik sebanding dengan kondisi harian Anda.`,
      link: '/pasien/kepatuhan',
    })
  },
}
