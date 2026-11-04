import type { Prisma } from '@prisma/client'
import { prisma } from '~~/server/utils/prisma'

export const notificationSelect = {
  id: true,
  recipientId: true,
  category: true,
  title: true,
  body: true,
  patientId: true,
  link: true,
  isRead: true,
  readAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.NotificationSelect

export const notificationPageSelect = {
  ...notificationSelect,
  patient: { select: { id: true, fullName: true } },
} satisfies Prisma.NotificationSelect

export type NotificationPageRecord = Prisma.NotificationGetPayload<{
  select: typeof notificationPageSelect
}>

/**
 * Kotak masuk satu tabel dimiliki dua jenis akun, jadi setiap pembacaan wajib menyebut
 * pemiliknya lewat tepat satu kolom. Union (bukan object dengan dua field opsional) membuat
 * `{ recipientId: undefined }` tidak mungkin lolos tipe.
 */
export type NotificationInboxOwner = { recipientId: string } | { recipientPatientId: string }

export const notificationRepository = {
  findPage(where: Prisma.NotificationWhereInput, skip: number, take: number) {
    return prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
        skip,
        take,
        select: notificationPageSelect,
      }),
      prisma.notification.count({ where }),
    ])
  },

  findById(id: string, owner: NotificationInboxOwner) {
    return prisma.notification.findFirst({
      where: { id, ...owner },
      select: notificationPageSelect,
    })
  },

  create(data: Prisma.NotificationUncheckedCreateInput) {
    return prisma.notification.create({
      data,
      select: notificationPageSelect,
    })
  },

  markRead(id: string, owner: NotificationInboxOwner, readAt: Date) {
    return prisma.notification.updateMany({
      where: { id, ...owner, isRead: false },
      data: { isRead: true, readAt },
    })
  },

  markAllRead(owner: NotificationInboxOwner, readAt: Date) {
    return prisma.notification.updateMany({
      where: { ...owner, isRead: false },
      data: { isRead: true, readAt },
    })
  },

  countByRead(owner: NotificationInboxOwner) {
    return prisma.notification.groupBy({
      by: ['isRead'],
      where: { ...owner },
      _count: { _all: true },
    })
  },

  findRecent(owner: NotificationInboxOwner, title: string, since: Date) {
    return prisma.notification.findFirst({
      where: { ...owner, title, createdAt: { gte: since } },
      select: { id: true },
    })
  },
}
