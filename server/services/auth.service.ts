import type { LoginInput, LoginRole } from '~~/shared/schemas/auth.schema'
import type { AuthUser } from '~~/shared/types/auth'
import { compareSync } from 'bcryptjs'
import { healthWorkerRepository } from '~~/server/repositories/health-worker.repository'

export type AuthFailureReason = 'account-inactive' | 'invalid-credentials' | 'role-mismatch' | 'unsupported-role'

export type LoginResult =
  | { ok: false, reason: AuthFailureReason }
  | { ok: true, user: AuthUser, rememberMe: boolean }

const NAKES_ACCESS_LEVELS = ['dokter', 'perawat'] as const

function accessMatchesRole(accessLevel: AuthUser['accessLevel'], role: LoginRole) {
  if (role === 'admin') return accessLevel === 'admin'
  return (NAKES_ACCESS_LEVELS as readonly string[]).includes(accessLevel)
}

export const authService = {
  async login(input: LoginInput): Promise<LoginResult> {
    if (input.role === 'pasien') return { ok: false, reason: 'unsupported-role' }

    const worker = await healthWorkerRepository.findByCredential(input.identifier)
    if (!worker) return { ok: false, reason: 'invalid-credentials' }

    const passwordMatches = compareSync(input.password, worker.passwordHash)
    if (!passwordMatches) return { ok: false, reason: 'invalid-credentials' }

    if (!accessMatchesRole(worker.accessLevel, input.role))
      return { ok: false, reason: 'role-mismatch' }

    if (worker.status === 'nonaktif') return { ok: false, reason: 'account-inactive' }

    const { passwordHash: _passwordHash, ...user } = worker
    return { ok: true, user, rememberMe: input.rememberMe }
  },

  sessionUserById(id: string) {
    return healthWorkerRepository.findSessionUser(id)
  },
}
