import type { Prisma } from '@prisma/client'
import type { CareTaskSession } from '~~/shared/schemas/patient-care.schema'
import { careTaskBuiltinTemplates } from '~~/shared/types/care-task'
import { careTaskSelect } from '~~/server/repositories/patient-care.repository'
import { prisma } from '~~/server/utils/prisma'

/** Select staf: kolom task + flag builtin + jumlah riwayat centang untuk memutuskan boleh-tidaknya hapus. */
export const careTaskAdminSelect = {
  ...careTaskSelect,
  isBuiltin: true,
  _count: { select: { completions: true } },
} satisfies Prisma.CareTaskSelect

export type CareTaskAdminRow = Prisma.CareTaskGetPayload<{ select: typeof careTaskAdminSelect }>

interface CareTaskFields {
  session: CareTaskSession
  title: string
  instruction: string
  timeStart: string
  timeEnd: string
}

export const careTaskRepository = {
  findPatientRef: (patientId: string) =>
    prisma.patient.findUnique({ where: { id: patientId }, select: { id: true, fullName: true } }),

  findManyByPatient: (patientId: string) =>
    prisma.careTask.findMany({
      where: { patientId },
      select: careTaskAdminSelect,
      orderBy: [{ session: 'asc' }, { timeStart: 'asc' }, { title: 'asc' }],
    }),

  findById: (id: string) =>
    prisma.careTask.findUnique({ where: { id }, select: careTaskAdminSelect }),

  /**
   * Lazy-create sesi bawaan yang belum ada untuk pasien ini. Idempoten; race dua
   * request pertama sengaja ditoleransi (duplikat ringan, tanpa unique constraint baru).
   */
  ensureBuiltinTasks: async (patientId: string) => {
    const existing = await prisma.careTask.findMany({
      where: { patientId, isBuiltin: true },
      select: { session: true },
    })
    const done = new Set(existing.map(row => row.session))
    const missing = careTaskBuiltinTemplates.filter(template => !done.has(template.session))
    if (missing.length === 0) return
    await prisma.careTask.createMany({
      data: missing.map(template => ({ ...template, patientId, isBuiltin: true })),
    })
  },

  create: (data: CareTaskFields & { patientId: string }) =>
    prisma.careTask.create({ data, select: careTaskAdminSelect }),

  update: (id: string, data: CareTaskFields) =>
    prisma.careTask.update({ where: { id }, data, select: careTaskAdminSelect }),

  /**
   * Guard `isBuiltin: false` dan `completions: none` dievaluasi DB di statement yang sama
   * dengan DELETE, sehingga sesi bawaan tidak mungkin terhapus dan `onDelete: Cascade`
   * tidak mungkin menghapus riwayat kepatuhan walau ada centang bersamaan.
   * Jika delete tidak mengenai baris, query kedua menentukan alasannya.
   */
  deleteIfNoCompletions: (id: string) =>
    prisma.$transaction(async (tx) => {
      const deleteResult = await tx.careTask.deleteMany({
        where: { id, isBuiltin: false, completions: { none: {} } },
      })
      if (deleteResult.count > 0) return { deleted: true as const }

      const task = await tx.careTask.findUnique({
        where: { id },
        select: {
          id: true,
          isBuiltin: true,
          _count: { select: { completions: true } },
        },
      })
      if (!task) return { deleted: false as const, reason: 'not_found' as const }
      if (task.isBuiltin) return { deleted: false as const, reason: 'builtin' as const }
      return {
        deleted: false as const,
        reason: 'has_completions' as const,
        completionCount: task._count.completions,
      }
    }),
}
