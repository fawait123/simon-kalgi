import { z } from 'zod'

export const educationCategorySchema = z.enum(['menyikat', 'kalkulus', 'gusi', 'diet', 'faq'], {
  errorMap: () => ({ message: 'Pilih kategori materi' }),
})
export const educationFormatSchema = z.enum(['artikel', 'video', 'checklist'], {
  errorMap: () => ({ message: 'Pilih format materi' }),
})

const optionalCoverUrl = z.preprocess(
  value => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().url('URL cover tidak valid').max(500, 'Maksimal 500 karakter').optional(),
)

export const createEducationSchema = z.object({
  title: z.string().trim().min(5, 'Judul minimal 5 karakter').max(200, 'Maksimal 200 karakter'),
  excerpt: z.string().trim().min(10, 'Ringkasan minimal 10 karakter').max(320, 'Maksimal 320 karakter'),
  body: z.string().trim().min(20, 'Isi materi minimal 20 karakter'),
  category: educationCategorySchema,
  format: educationFormatSchema.default('artikel'),
  coverImageUrl: optionalCoverUrl,
  readMinutes: z.coerce.number().int().min(1, 'Minimal 1 menit').max(60, 'Maksimal 60 menit').default(4),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
})

export const updateEducationSchema = createEducationSchema.partial()

export const educationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(6),
  search: z.string().trim().max(150).optional(),
  category: z.union([z.literal('all'), educationCategorySchema]).default('all'),
  format: z.union([z.literal('all'), educationFormatSchema]).default('all'),
  status: z.union([z.literal('all'), z.literal('published'), z.literal('draft')]).default('all'),
})

export const patientEducationSortSchema = z.enum(['terkini', 'populer', 'dpjp'], {
  errorMap: () => ({ message: 'Pilih urutan materi' }),
})

export const patientEducationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(20).default(6),
  search: z.string().trim().max(150).optional(),
  category: z.union([z.literal('all'), educationCategorySchema]).default('all'),
  format: z.union([z.literal('all'), educationFormatSchema]).default('all'),
  sort: patientEducationSortSchema.default('terkini'),
})

export type CreateEducationInput = z.infer<typeof createEducationSchema>
export type UpdateEducationInput = z.infer<typeof updateEducationSchema>
export type EducationListQuery = z.output<typeof educationListQuerySchema>
export type PatientEducationQuery = z.output<typeof patientEducationQuerySchema>
export type EducationCategory = z.infer<typeof educationCategorySchema>
export type EducationFormat = z.infer<typeof educationFormatSchema>
export type EducationStatusFilter = EducationListQuery['status']
export type PatientEducationSort = z.infer<typeof patientEducationSortSchema>
