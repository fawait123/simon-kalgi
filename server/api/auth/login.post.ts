import type { LoginRole } from '~~/shared/schemas/auth.schema'
import type { AuthFailureReason } from '~~/server/services/auth.service'
import { loginSchema } from '~~/shared/schemas/auth.schema'
import { authService } from '~~/server/services/auth.service'
import {
  REMEMBER_MAX_AGE_SECONDS,
  SESSION_MAX_AGE_SECONDS,
  setSessionCookie,
  signSessionToken,
} from '~~/server/utils/auth'
import { createApiError, handleApiError } from '~~/server/utils/errors'

function failureError(reason: AuthFailureReason, role: LoginRole) {
  if (reason === 'invalid-credentials') {
    return createApiError(401, role === 'pasien'
      ? 'Kredensial pasien tidak dikenali. Periksa Nomor Rekam Medis / NIK / Email dan kata sandi Anda.'
      : 'Kredensial tidak dikenali. Periksa kembali ID medis / username / email dan kata sandi Anda.')
  }
  return createApiError(403, 'Akun Anda dinonaktifkan. Hubungi administrator klinik untuk aktivasi kembali.')
}

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, data => loginSchema.parse(data))
  try {
    const result = await authService.login(body)
    if (!result.ok) throw failureError(result.reason, body.role)

    const maxAge = result.rememberMe ? REMEMBER_MAX_AGE_SECONDS : SESSION_MAX_AGE_SECONDS
    const token = await signSessionToken(
      { sub: result.user.id, scope: result.scope, medicalId: result.user.medicalId, fullName: result.user.fullName },
      maxAge,
    )
    setSessionCookie(event, token, maxAge)

    return { data: result.user }
  }
  catch (error) {
    throw handleApiError(error)
  }
})
