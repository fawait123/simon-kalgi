import type { Prisma } from '@prisma/client'
import { prisma } from '~~/server/utils/prisma'

export const careTaskSelect = {
  id: true,
  patientId: true,
  session: true,
  title: true,
  instruction: true,
  timeStart: true,
  timeEnd: true,
} satisfies Prisma.CareTaskSelect

/** Ringkas: hanya kolom yang dipakai agregasi harian di service. */
export const careCompletionSelect = {
  taskId: true,
  logDate: true,
  completedAt: true,
} satisfies Prisma.CareTaskCompletionSelect

const careMonitoringSelect = {
  programName: true,
  doctorNote: true,
  validatedByClinician: true,
  baselineOhisScore: true,
  updatedAt: true,
} satisfies Prisma.PatientMonitoringSelect

/** Tidak memuat `passwordHash`, `nik`, maupun `address` — portal pasien hanya butuh identitas + skor. */
export const portalPatientSelect = {
  id: true,
  medicalRecordNo: true,
  fullName: true,
  ohisScore: true,
  ohisCategory: true,
  nextVisitClinician: true,
  monitoring: { select: careMonitoringSelect },
} satisfies Prisma.PatientSelect

export type CareTaskRow = Prisma.CareTaskGetPayload<{ select: typeof careTaskSelect }>
export type CareCompletionRow = Prisma.CareTaskCompletionGetPayload<{
  select: typeof careCompletionSelect
}>
export type PortalPatient = Prisma.PatientGetPayload<{ select: typeof portalPatientSelect }>

export const patientCareRepository = {
  findPortalPatient: (patientId: string) =>
    prisma.patient.findUnique({ where: { id: patientId }, select: portalPatientSelect }),

  findTasks: (patientId: string) =>
    prisma.careTask.findMany({
      where: { patientId },
      select: careTaskSelect,
      orderBy: [{ session: 'asc' }, { timeStart: 'asc' }, { title: 'asc' }],
    }),

  findCompletionsSince: (patientId: string, since: Date) =>
    prisma.careTaskCompletion.findMany({
      where: { patientId, logDate: { gte: since } },
      select: careCompletionSelect,
    }),

  /** Predikat dua kolom, jadi `findFirst` (bukan `findUnique`) — sekaligus cek kepemilikan. */
  findOwnedTask: (taskId: string, patientId: string) =>
    prisma.careTask.findFirst({ where: { id: taskId, patientId }, select: careTaskSelect }),

  markDone: (args: { taskId: string, patientId: string, logDate: Date, completedAt: Date }) =>
    prisma.careTaskCompletion.upsert({
      where: { taskId_logDate: { taskId: args.taskId, logDate: args.logDate } },
      // `update: {}` menjaga `completed_at` pertama: centang ulang tidak memindahkan jam 07:15.
      update: {},
      create: {
        taskId: args.taskId,
        patientId: args.patientId,
        logDate: args.logDate,
        completedAt: args.completedAt,
      },
      select: careCompletionSelect,
    }),

  unmarkDone: (args: { taskId: string, patientId: string, logDate: Date }) =>
    prisma.careTaskCompletion.deleteMany({ where: args }),

  findCompletion: (taskId: string, logDate: Date) =>
    prisma.careTaskCompletion.findUnique({
      where: { taskId_logDate: { taskId, logDate } },
      select: careCompletionSelect,
    }),
}
