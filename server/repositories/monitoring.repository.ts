import type { Prisma } from '@prisma/client'
import { prisma } from '~~/server/utils/prisma'

export const monitoringSelect = {
  id: true,
  patientId: true,
  programName: true,
  status: true,
  checklistPercent: true,
  baselineOhisScore: true,
  baselineDebrisIndex: true,
  baselineCalculusIndex: true,
  scheduledVisitAt: true,
  scheduledVisitNote: true,
  reminderConfirmed: true,
  reminderSentAt: true,
  doctorNote: true,
  validatedByClinician: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PatientMonitoringSelect

export const monitoringVisitSelect = {
  id: true,
  patientId: true,
  visitDate: true,
  title: true,
  clinicianName: true,
  ohisScore: true,
  note: true,
} satisfies Prisma.PatientVisitSelect

const monitoringPatientSelect = {
  id: true,
  medicalRecordNo: true,
  fullName: true,
  birthDate: true,
  gender: true,
  phone: true,
  ohisScore: true,
  debrisIndex: true,
  calculusIndex: true,
  ohisCategory: true,
  lastVisitAt: true,
  nextVisitClinician: true,
} satisfies Prisma.PatientSelect

export const monitoringListSelect = {
  ...monitoringSelect,
  patient: { select: monitoringPatientSelect },
} satisfies Prisma.PatientMonitoringSelect

export const monitoringDetailSelect = {
  ...monitoringSelect,
  patient: {
    select: {
      ...monitoringPatientSelect,
      visits: {
        select: monitoringVisitSelect,
        orderBy: [{ visitDate: 'desc' as const }, { createdAt: 'desc' as const }],
        take: 6,
      },
    },
  },
} satisfies Prisma.PatientMonitoringSelect

export type MonitoringListRow = Prisma.PatientMonitoringGetPayload<{
  select: typeof monitoringListSelect
}>
export type MonitoringDetailRecord = Prisma.PatientMonitoringGetPayload<{
  select: typeof monitoringDetailSelect
}>
export type MonitoringVisit = Prisma.PatientVisitGetPayload<{
  select: typeof monitoringVisitSelect
}>

export const monitoringRepository = {
  async findPage(args: {
    where: Prisma.PatientMonitoringWhereInput
    page: number
    pageSize: number
  }) {
    const { where, page, pageSize } = args
    const [items, total] = await prisma.$transaction([
      prisma.patientMonitoring.findMany({
        where,
        select: monitoringListSelect,
        orderBy: [
          { scheduledVisitAt: { sort: 'asc', nulls: 'last' } },
          { patient: { fullName: 'asc' } },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.patientMonitoring.count({ where }),
    ])
    return { items, total }
  },

  findLatestVisits(patientIds: string[]) {
    if (patientIds.length === 0) {
      return Promise.resolve([] as MonitoringVisit[])
    }
    return prisma.patientVisit.findMany({
      where: { patientId: { in: patientIds } },
      select: monitoringVisitSelect,
      orderBy: [{ visitDate: 'desc' }, { createdAt: 'desc' }],
    })
  },

  findByPatientId(patientId: string) {
    return prisma.patientMonitoring.findUnique({
      where: { patientId },
      select: monitoringDetailSelect,
    })
  },

  findSnapshot() {
    return prisma.patientMonitoring.findMany({
      select: {
        status: true,
        checklistPercent: true,
        baselineOhisScore: true,
        baselineDebrisIndex: true,
        baselineCalculusIndex: true,
        patient: {
          select: {
            ohisScore: true,
            debrisIndex: true,
            calculusIndex: true,
          },
        },
      },
    })
  },

  findVisitsSince(visitDate: Date) {
    return prisma.patientVisit.findMany({
      where: { visitDate: { gte: visitDate }, ohisScore: { not: null } },
      select: { visitDate: true, ohisScore: true },
    })
  },

  findPatientBase(patientId: string) {
    return prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        medicalRecordNo: true,
        fullName: true,
        ohisScore: true,
        debrisIndex: true,
        calculusIndex: true,
        monitoring: { select: { status: true, programName: true } },
      },
    })
  },

  saveSchedule(args: {
    patientId: string
    update: Prisma.PatientMonitoringUpdateInput
    create: Prisma.PatientMonitoringUncheckedCreateInput
    patient: Prisma.PatientUpdateInput
  }) {
    return prisma.$transaction(async (client) => {
      const monitoring = await client.patientMonitoring.upsert({
        where: { patientId: args.patientId },
        update: args.update,
        create: args.create,
        select: monitoringSelect,
      })
      await client.patient.update({ where: { id: args.patientId }, data: args.patient })
      return monitoring
    })
  },

  markReminder(patientId: string, reminderSentAt: Date) {
    return prisma.patientMonitoring.update({
      where: { patientId },
      data: { reminderSentAt, reminderConfirmed: true },
      select: {
        id: true,
        patientId: true,
        reminderSentAt: true,
        reminderConfirmed: true,
        scheduledVisitAt: true,
        patient: { select: { fullName: true } },
      },
    })
  },

  /** Mengaktifkan pengingat in-app H-1 untuk jadwal kontrol pasien (`reminder_confirmed`). */
  confirmReminder(patientId: string) {
    return prisma.patientMonitoring.update({
      where: { patientId },
      data: { reminderConfirmed: true },
      select: {
        id: true,
        patientId: true,
        reminderSentAt: true,
        reminderConfirmed: true,
        scheduledVisitAt: true,
        updatedAt: true,
        patient: { select: { fullName: true } },
      },
    })
  },

  blastReminders(reminderSentAt: Date) {
    return prisma.patientMonitoring.updateMany({
      where: { status: { in: ['terlambat', 'kritis'] } },
      data: { reminderSentAt },
    })
  },
}
