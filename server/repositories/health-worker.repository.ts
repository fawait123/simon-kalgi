import type { Prisma } from '@prisma/client'
import { prisma } from '~~/server/utils/prisma'

export const healthWorkerSelect = {
  id: true,
  medicalId: true,
  fullName: true,
  nik: true,
  birthDate: true,
  gender: true,
  employmentStatus: true,
  role: true,
  specialization: true,
  strNumber: true,
  strExpiryDate: true,
  phone: true,
  email: true,
  address: true,
  username: true,
  accessLevel: true,
  dutyDays: true,
  dutyTime: true,
  status: true,
  isPic: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.HealthWorkerSelect

type DBClient = Prisma.TransactionClient | typeof prisma

export const healthWorkerSessionSelect = {
  id: true,
  medicalId: true,
  fullName: true,
  username: true,
  email: true,
  role: true,
  specialization: true,
  accessLevel: true,
  status: true,
  isPic: true,
  avatarUrl: true,
  dutyDays: true,
  dutyTime: true,
} satisfies Prisma.HealthWorkerSelect

export const healthWorkerAuthSelect = { ...healthWorkerSessionSelect, passwordHash: true }

export const healthWorkerRepository = {
  transaction<T>(callback: (client: Prisma.TransactionClient) => Promise<T>) {
    return prisma.$transaction(callback)
  },

  async findPage(args: { where: Prisma.HealthWorkerWhereInput; page: number; pageSize: number }) {
    const { where, page, pageSize } = args
    const [items, total] = await prisma.$transaction([
      prisma.healthWorker.findMany({
        where,
        select: healthWorkerSelect,
        orderBy: [{ isPic: 'desc' }, { role: 'asc' }, { fullName: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.healthWorker.count({ where }),
    ])
    return { items, total }
  },

  findById(id: string, client: DBClient = prisma) {
    return client.healthWorker.findUnique({ where: { id }, select: healthWorkerSelect })
  },

  findSessionUser(id: string, client: DBClient = prisma) {
    return client.healthWorker.findUnique({ where: { id }, select: healthWorkerSessionSelect })
  },

  findByCredential(identifier: string, client: DBClient = prisma) {
    return client.healthWorker.findFirst({
      where: {
        OR: [
          { username: { equals: identifier, mode: 'insensitive' } },
          { email: { equals: identifier, mode: 'insensitive' } },
          { medicalId: { equals: identifier, mode: 'insensitive' } },
        ],
      },
      select: healthWorkerAuthSelect,
    })
  },

  countByMedicalIdPrefix(prefix: string, client: DBClient = prisma) {
    return client.healthWorker.count({ where: { medicalId: { startsWith: prefix } } })
  },

  groupStats() {
    return prisma.healthWorker.groupBy({
      by: ['role', 'status'],
      _count: { _all: true },
    })
  },

  create(data: Prisma.HealthWorkerUncheckedCreateInput, client: DBClient = prisma) {
    return client.healthWorker.create({ data, select: healthWorkerSelect })
  },

  update(id: string, data: Prisma.HealthWorkerUpdateInput, client: DBClient = prisma) {
    return client.healthWorker.update({ where: { id }, data, select: healthWorkerSelect })
  },

  delete(id: string, client: DBClient = prisma) {
    return client.healthWorker.delete({ where: { id }, select: healthWorkerSelect })
  },
}
