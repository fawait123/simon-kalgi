import type { BloodType, ControlPriority, Gender, OhisCategory } from '@prisma/client'

export interface PatientProfileDto {
  id: string
  medicalRecordNo: string
  fullName: string
  nik: string
  birthDate: string
  birthPlace: string | null
  gender: Gender
  bloodType: BloodType | null
  phone: string
  email: string | null
  address: string
  occupation: string | null
  avatarUrl: string | null
  allergyAntibiotics: boolean
  hypertension: boolean
  diabetes: boolean
  ohisScore: number | null
  ohisCategory: OhisCategory | null
  lastVisitAt: string | null
  nextVisitAt: string | null
  nextVisitClinician: string | null
  controlTitle: string | null
  controlPriority: ControlPriority
  emergencyName: string | null
  emergencyRelation: string | null
  emergencyPhone: string | null
  emergencyEmail: string | null
  emergencyAddress: string | null
  insuranceType: string | null
  insurancePolicyNo: string | null
  insuranceClass: string | null
  insuranceValidUntil: string | null
  totalVisits: number
  portalEnabled: boolean
  updatedAt: string
}
