import type { ChangePatientPasswordInput, UpdatePatientProfileInput } from '~~/shared/schemas/patient-profile.schema'
import { compareSync, hashSync } from 'bcryptjs'
import { patientRepository } from '~~/server/repositories/patient.repository'
import { createApiError } from '~~/server/utils/errors'

export const patientProfileService = {
  async getProfile(patientId: string) {
    const patient = await patientRepository.findProfile(patientId)
    if (!patient)
      throw createApiError(404, 'Data pasien tidak ditemukan. Silakan hubungi administrator klinik.')

    const { passwordHash, ...profile } = patient
    const totalVisits = await patientRepository.countVisits(patientId)
    return { ...profile, totalVisits, portalEnabled: Boolean(passwordHash) }
  },

  async updateProfile(patientId: string, input: UpdatePatientProfileInput) {
    const patient = await patientRepository.findProfile(patientId)
    if (!patient)
      throw createApiError(404, 'Data pasien tidak ditemukan. Silakan hubungi administrator klinik.')

    const { passwordHash, ...profile } = await patientRepository.updateProfile(patientId, input)
    const totalVisits = await patientRepository.countVisits(patientId)
    return { ...profile, totalVisits, portalEnabled: Boolean(passwordHash) }
  },

  async changePassword(patientId: string, input: ChangePatientPasswordInput) {
    const patient = await patientRepository.findForPasswordChange(patientId)
    if (!patient)
      throw createApiError(404, 'Data pasien tidak ditemukan.')

    if (!patient.passwordHash)
      throw createApiError(400, 'Akun portal pasien belum diaktifkan. Hubungi administrator klinik.')

    if (!compareSync(input.currentPassword, patient.passwordHash))
      throw createApiError(400, 'Kata sandi saat ini tidak sesuai.')

    if (input.newPassword === input.currentPassword)
      throw createApiError(400, 'Kata sandi baru tidak boleh sama dengan kata sandi saat ini.')

    await patientRepository.updatePasswordHash(patientId, hashSync(input.newPassword, 10))
    return { changedAt: new Date().toISOString() }
  },
}
