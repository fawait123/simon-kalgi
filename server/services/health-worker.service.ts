import type { Prisma } from '@prisma/client'
import type {
  CreateHealthWorkerInput,
  HealthWorkerListQuery,
  UpdateHealthWorkerInput,
} from '~~/shared/schemas/health-worker.schema'
import type { HealthWorkerStatsDto } from '~~/shared/types/health-worker'
import { hashSync } from 'bcryptjs'
import { healthWorkerRepository } from '~~/server/repositories/health-worker.repository'

const NURSE_ROLES = ['perawat', 'asisten'] as const

function buildWhere(query: HealthWorkerListQuery): Prisma.HealthWorkerWhereInput {
  const where: Prisma.HealthWorkerWhereInput = {}
  if (query.role !== 'all') where.role = query.role
  if (query.status !== 'all') where.status = query.status

  const search = query.search?.trim()
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { nik: { contains: search } },
      { strNumber: { contains: search, mode: 'insensitive' } },
      { specialization: { contains: search, mode: 'insensitive' } },
      { medicalId: { contains: search, mode: 'insensitive' } },
    ]
  }
  return where
}

function toMedicalIdPrefix(role: CreateHealthWorkerInput['role']) {
  return (NURSE_ROLES as readonly string[]).includes(role) ? 'DC-NUR-' : 'DC-DOC-'
}

export const healthWorkerService = {
  async list(query: HealthWorkerListQuery) {
    const where = buildWhere(query)
    const { items, total } = await healthWorkerRepository.findPage({
      where,
      page: query.page,
      pageSize: query.pageSize,
    })
    return { data: items, meta: { page: query.page, pageSize: query.pageSize, total } }
  },

  async stats(): Promise<HealthWorkerStatsDto> {
    const grouped = await healthWorkerRepository.groupStats()
    const sum = (predicate: (row: (typeof grouped)[number]) => boolean) =>
      grouped.filter(predicate).reduce((acc, row) => acc + row._count._all, 0)

    const total = sum(() => true)
    const active = sum((row) => row.status === 'aktif')

    return {
      total,
      active,
      dentalSpecialists: sum((row) => row.role === 'spesialis'),
      generalDentists: sum((row) => row.role === 'umum'),
      dentalNurses: sum((row) => row.role === 'perawat' || row.role === 'asisten'),
      dutyPercent: total === 0 ? 0 : Math.round((active / total) * 100),
    }
  },

  getById(id: string) {
    return healthWorkerRepository.findById(id)
  },

  create(input: CreateHealthWorkerInput) {
    const passwordHash = hashSync(input.password, 10)
    const { password: _password, ...rest } = input

    return healthWorkerRepository.transaction(async (client) => {
      const existing = await healthWorkerRepository.countByMedicalIdPrefix(
        toMedicalIdPrefix(input.role),
        client,
      )
      const medicalId = `${toMedicalIdPrefix(input.role)}${String(existing + 1).padStart(3, '0')}`
      return healthWorkerRepository.create({ ...rest, medicalId, passwordHash }, client)
    })
  },

  async update(id: string, input: UpdateHealthWorkerInput) {
    const { password, ...rest } = input
    const data: Prisma.HealthWorkerUpdateInput = { ...rest }
    if (password) data.passwordHash = hashSync(password, 10)
    return healthWorkerRepository.update(id, data)
  },

  remove(id: string) {
    return healthWorkerRepository.delete(id)
  },
}
