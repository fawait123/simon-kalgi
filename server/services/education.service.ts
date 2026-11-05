import type { Prisma } from '@prisma/client'
import type {
  CreateEducationInput,
  EducationListQuery,
  PatientEducationQuery,
  UpdateEducationInput,
} from '~~/shared/schemas/education.schema'
import type { EducationArticleDto, EducationStatsDto } from '~~/shared/types/education'
import { educationDetailSelect, educationRepository } from '~~/server/repositories/education.repository'
import { createApiError } from '~~/server/utils/errors'

function buildListWhere(query: EducationListQuery): Prisma.EducationArticleWhereInput {
  const where: Prisma.EducationArticleWhereInput = {}
  if (query.category !== 'all') where.category = query.category
  if (query.format !== 'all') where.format = query.format
  if (query.status === 'published') where.isPublished = true
  if (query.status === 'draft') where.isPublished = false

  const search = query.search?.trim()
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ]
  }
  return where
}

const adminOrderBy: Prisma.EducationArticleOrderByWithRelationInput[] = [{ createdAt: 'desc' }]

function toDto<T extends { createdAt: Date, updatedAt: Date }>(row: T): Omit<T, 'createdAt' | 'updatedAt'> & { createdAt: string, updatedAt: string } {
  return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() }
}

export const educationService = {
  async list(query: EducationListQuery) {
    const { items, total } = await educationRepository.findPage({
      where: buildListWhere(query),
      orderBy: adminOrderBy,
      page: query.page,
      pageSize: query.pageSize,
      // Admin butuh `body` supaya dialog edit langsung berisi konten penuh tanpa request kedua.
      select: educationDetailSelect,
    })
    return {
      data: items.map(item => toDto(item)) as EducationArticleDto[],
      meta: { page: query.page, pageSize: query.pageSize, total },
    }
  },

  async stats(): Promise<EducationStatsDto> {
    const { total, published, viewsTotal } = await educationRepository.stats()
    return { total, published, draft: total - published, viewsTotal }
  },

  async getById(id: string) {
    const row = await educationRepository.findById(id)
    if (!row) throw createApiError(404, 'Materi edukasi tidak ditemukan.')
    return toDto(row)
  },

  async create(input: CreateEducationInput) {
    const row = await educationRepository.create(input)
    return toDto(row)
  },

  async update(id: string, input: UpdateEducationInput) {
    await this.getById(id)
    const row = await educationRepository.update(id, input)
    return toDto(row)
  },

  async remove(id: string) {
    await this.getById(id)
    await educationRepository.delete(id)
    return { id }
  },
}

const patientWhere = (query: PatientEducationQuery): Prisma.EducationArticleWhereInput => ({
  isPublished: true,
  ...(query.category !== 'all' ? { category: query.category } : {}),
  ...(query.format !== 'all' ? { format: query.format } : {}),
  ...(query.search?.trim()
    ? {
        OR: [
          { title: { contains: query.search.trim(), mode: 'insensitive' } },
          { excerpt: { contains: query.search.trim(), mode: 'insensitive' } },
        ],
      }
    : {}),
})

const patientOrderBy: Record<PatientEducationQuery['sort'], Prisma.EducationArticleOrderByWithRelationInput[]> = {
  terkini: [{ createdAt: 'desc' }],
  populer: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
  dpjp: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
}

export const patientEducationService = {
  async list(query: PatientEducationQuery) {
    const { items, total } = await educationRepository.findPage({
      where: patientWhere(query),
      orderBy: patientOrderBy[query.sort],
      page: query.page,
      pageSize: query.pageSize,
    })
    return {
      data: items.map(item => toDto(item)) as EducationArticleDto[],
      meta: { page: query.page, pageSize: query.pageSize, total },
    }
  },

  async detail(id: string) {
    const exists = await educationRepository.findById(id, { isPublished: true })
    if (!exists?.isPublished) throw createApiError(404, 'Materi edukasi tidak ditemukan.')
    const row = await educationRepository.detailWithView(id)
    if (!row) throw createApiError(404, 'Materi edukasi tidak ditemukan.')
    return toDto(row)
  },
}
