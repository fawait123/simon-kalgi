import type { OhisCategory } from '@prisma/client'

/** Ringkas satu kunjungan pada daftar riwayat; detail lengkapnya memakai `ExaminationDetailDto`. */
export interface PatientExamSessionDto {
  id: string
  examDate: string
  examinerName: string
  ohisScore: number
  ohisCategory: OhisCategory
  healthyTeeth: number
  dmftScore: number
  chiefComplaint: string
  nextVisitAt: string | null
}

export interface PatientExamSessionListDto {
  data: PatientExamSessionDto[]
  meta: {
    total: number
    /** Kunci seleksi awal halaman; `null` bila pasien belum punya rekam medis final. */
    latestId: string | null
  }
}
