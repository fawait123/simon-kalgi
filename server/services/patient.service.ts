import type { Prisma } from '@prisma/client'
import type {
  CreatePatientInput,
  PatientListQuery,
  UpdatePatientInput,
} from '~~/shared/schemas/patient.schema'
import { patientRepository } from '~~/server/repositories/patient.repository'

const RECORD_PREFIX = 'RM-2025-'

function nextRecordNoFrom(latest?: string | null) {
  const lastNumber = latest ? Number.parseInt(latest.slice(RECORD_PREFIX.length), 10) : 0
  const nextNumber = Number.isNaN(lastNumber) ? 1 : lastNumber + 1
  return `${RECORD_PREFIX}${String(nextNumber).padStart(4, '0')}`
}

function buildWhere(query: PatientListQuery): Prisma.PatientWhereInput {
  const where: Prisma.PatientWhereInput = {}
  if (query.gender !== 'all') where.gender = query.gender
  if (query.ohis !== 'all') where.ohisCategory = query.ohis

  const search = query.search?.trim()
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { nik: { contains: search } },
      { medicalRecordNo: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ]
  }
  return where
}

function buildOrderBy(sort: PatientListQuery['sort']): Prisma.PatientOrderByWithRelationInput[] {
  if (sort === 'name_asc')
    return [{ fullName: 'asc' }]
  if (sort === 'name_desc')
    return [{ fullName: 'desc' }]
  return [{ medicalRecordNo: 'desc' }]
}

export const patientService = {
  async list(query: PatientListQuery) {
    const { items, total } = await patientRepository.findPage({
      where: buildWhere(query),
      orderBy: buildOrderBy(query.sort),
      page: query.page,
      pageSize: query.pageSize,
    })
    return { data: items, meta: { page: query.page, pageSize: query.pageSize, total } }
  },

  async nextRecordNo() {
    const latest = await patientRepository.findLatestRecordNo()
    return { medicalRecordNo: nextRecordNoFrom(latest?.medicalRecordNo) }
  },

  getById(id: string) {
    return patientRepository.findById(id)
  },

  create(input: CreatePatientInput) {
    const data: Omit<Prisma.PatientCreateInput, 'medicalRecordNo'> = {
      fullName: input.fullName,
      nik: input.nik,
      birthDate: input.birthDate,
      gender: input.gender,
      phone: input.phone,
      address: input.address,
      allergyAntibiotics: input.allergyAntibiotics,
      hypertension: input.hypertension,
      diabetes: input.diabetes,
      ...(input.bloodType ? { bloodType: input.bloodType } : {}),
      ...(input.email ? { email: input.email } : {}),
    }

    return patientRepository.transaction(async (client) => {
      const latest = await patientRepository.findLatestRecordNo(client)
      const medicalRecordNo = nextRecordNoFrom(latest?.medicalRecordNo)
      return patientRepository.create({ ...data, medicalRecordNo }, client)
    })
  },

  update(id: string, input: UpdatePatientInput) {
    const { birthDate, ...rest } = input
    const data: Prisma.PatientUpdateInput = {
      ...rest,
      ...(birthDate ? { birthDate } : {}),
    }
    return patientRepository.update(id, data)
  },

  remove(id: string) {
    return patientRepository.delete(id)
  },
}
