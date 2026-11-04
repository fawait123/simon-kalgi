import type { LoginInput } from '~~/shared/schemas/auth.schema'
import type { AuthUser, PatientAuthUser, StaffAuthUser } from '~~/shared/types/auth'
import type { SessionClaims } from '~~/server/utils/auth'
import { compareSync } from 'bcryptjs'
import { healthWorkerRepository } from '~~/server/repositories/health-worker.repository'
import { patientRepository } from '~~/server/repositories/patient.repository'

export type AuthFailureReason = 'account-inactive' | 'invalid-credentials'

export type LoginResult =
  | { ok: false, reason: AuthFailureReason }
  | { ok: true, scope: 'staff', user: StaffAuthUser, rememberMe: boolean }
  | { ok: true, scope: 'patient', user: PatientAuthUser, rememberMe: boolean }

async function loginStaff(input: LoginInput): Promise<LoginResult> {
  const worker = await healthWorkerRepository.findByCredential(input.identifier)
  if (!worker || !compareSync(input.password, worker.passwordHash))
    return { ok: false, reason: 'invalid-credentials' }
  if (worker.status === 'nonaktif') return { ok: false, reason: 'account-inactive' }

  const { passwordHash: _passwordHash, ...profile } = worker
  return { ok: true, scope: 'staff', user: { ...profile, scope: 'staff' }, rememberMe: input.rememberMe }
}

async function loginPatient(input: LoginInput): Promise<LoginResult> {
  const patient = await patientRepository.findByCredential(input.identifier)
  // `password_hash` kosong berarti portal pasien belum diaktifkan; status login apa pun dirahasiakan.
  if (!patient?.passwordHash || !compareSync(input.password, patient.passwordHash))
    return { ok: false, reason: 'invalid-credentials' }

  const { passwordHash: _passwordHash, medicalRecordNo, ...profile } = patient
  return {
    ok: true,
    scope: 'patient',
    user: { ...profile, scope: 'patient', medicalId: medicalRecordNo },
    rememberMe: input.rememberMe,
  }
}

export const authService = {
  login(input: LoginInput): Promise<LoginResult> {
    return input.role === 'pasien' ? loginPatient(input) : loginStaff(input)
  },

  /** Peta claims sesi ke user. Satu-satunya tempat yang tahu soal scope. */
  async resolveSessionUser(claims: SessionClaims): Promise<AuthUser | null> {
    if (claims.scope === 'patient') {
      const patient = await patientRepository.findSessionUser(claims.sub)
      if (!patient) return null
      return { ...patient, scope: 'patient', medicalId: patient.medicalRecordNo }
    }

    const worker = await healthWorkerRepository.findSessionUser(claims.sub)
    return worker ? { ...worker, scope: 'staff' } : null
  },
}
