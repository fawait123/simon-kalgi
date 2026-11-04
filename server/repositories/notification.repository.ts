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

  findById(id: string, recipientId: string) {
    return prisma.notification.findFirst({
      where: { id, recipientId },
      select: notificationPageSelect,
    })
  },

  create(data: Prisma.NotificationUncheckedCreateInput) {
    return prisma.notification.create({
      data,
      select: notificationPageSelect,
    })
  },

  markRead(id: string, recipientId: string, readAt: Date) {
    return prisma.notification.updateMany({
      where: { id, recipientId, isRead: false },
      data: { isRead: true, readAt },
    })
  },

  markAllRead(recipientId: string, readAt: Date) {
    return prisma.notification.updateMany({
      where: { recipientId, isRead: false },
      data: { isRead: true, readAt },
    })
  },

  countByRead(recipientId: string) {
    return prisma.notification.groupBy({
      by: ['isRead'],
      where: { recipientId },
      _count: { _all: true },
    })
  },

  findRecent(recipientId: string, title: string, since: Date) {
    return prisma.notification.findFirst({
      where: { recipientId, title, createdAt: { gte: since } },
      select: { id: true },
    })
  },
}
