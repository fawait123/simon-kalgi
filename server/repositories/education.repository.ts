import type { Prisma } from '@prisma/client'
import { prisma } from '~~/server/utils/prisma'

/** Daftar/kelola tidak butuh `body` (HTML penuh) — hanya detail reader yang memuatnya. */
export const educationSelect = {
  id: true,
  title: true,
  excerpt: true,
  category: true,
  format: true,
  coverImageUrl: true,
  readMinutes: true,
  isPublished: true,
  isFeatured: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EducationArticleSelect

export const educationDetailSelect = { ...educationSelect, body: true } satisfies Prisma.EducationArticleSelect

export const educationRepository = {
  async findPage(args: {
    where: Prisma.EducationArticleWhereInput
    orderBy: Prisma.EducationArticleOrderByWithRelationInput[]
    page: number
    pageSize: number
    select?: Prisma.EducationArticleSelect
  }) {
    const { where, orderBy, page, pageSize, select = educationSelect } = args
    const [items, total] = await prisma.$transaction([
      prisma.educationArticle.findMany({
        where,
        select,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.educationArticle.count({ where }),
    ])
    return { items, total }
  },

  findById(id: string, select: Prisma.EducationArticleSelect = educationDetailSelect) {
    return prisma.educationArticle.findUnique({ where: { id }, select })
  },

  create(data: Prisma.EducationArticleCreateInput) {
    return prisma.educationArticle.create({ data, select: educationSelect })
  },

  update(id: string, data: Prisma.EducationArticleUpdateInput) {
    return prisma.educationArticle.update({ where: { id }, data, select: educationSelect })
  },

  delete(id: string) {
    return prisma.educationArticle.delete({ where: { id }, select: { id: true } })
  },

  /** Satu queries count + satu aggregate view — dipanggil dalam $transaction agar konsisten. */
  async stats() {
    const [total, published, views] = await prisma.$transaction([
      prisma.educationArticle.count(),
      prisma.educationArticle.count({ where: { isPublished: true } }),
      prisma.educationArticle.aggregate({ _sum: { viewCount: true } }),
    ])
    return { total, published, viewsTotal: views._sum.viewCount ?? 0 }
  },

  /** Kenaikan viewCount + pembacaan detail dalam satu transaksi (view tidak hilang saat balikin data). */
  detailWithView(id: string, select: Prisma.EducationArticleSelect = educationDetailSelect) {
    return prisma.$transaction(async (client) => {
      await client.educationArticle.update({ where: { id }, data: { viewCount: { increment: 1 } } })
      return client.educationArticle.findUnique({ where: { id }, select })
    })
  },
}
