import { authService } from '~~/server/services/auth.service'
import { clearSessionCookie, readSessionClaims } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const claims = await readSessionClaims(event)
  if (!claims) return { data: null }

  const user = await authService.sessionUserById(claims.sub)
  if (!user) {
    clearSessionCookie(event)
    return { data: null }
  }

  return { data: user }
})
