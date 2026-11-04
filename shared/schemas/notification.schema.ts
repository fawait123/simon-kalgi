import { z } from 'zod'

export const notificationCategorySchema = z.enum(
  ['pengingat', 'jadwal', 'sistem'],
  { errorMap: () => ({ message: 'Kategori notifikasi tidak valid' }) },
)

export const notificationReadFilterSchema = z.enum(
  ['all', 'unread', 'read'],
  { errorMap: () => ({ message: 'Filter baca notifikasi tidak valid' }) },
)

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'Halaman minimal 1').default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(8),
  filter: notificationReadFilterSchema.default('all'),
})

export type NotificationCategory = z.infer<typeof notificationCategorySchema>
export type NotificationReadFilter = z.infer<typeof notificationReadFilterSchema>
export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>
