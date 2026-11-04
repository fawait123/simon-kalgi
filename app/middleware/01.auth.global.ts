import type { AuthSessionResponse } from '~~/shared/types/auth'
import { isRouteAllowed, LOGIN_PATH, resolveHomePath, resolveRedirect } from '~~/shared/config/access'

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, setSession } = useAuthSession()

  // Hydrasi sesi sekali di server memakai cookie asli permintaan.
  if (import.meta.server) {
    const response = await $fetch<AuthSessionResponse>('/api/auth/me', {
      headers: useRequestHeaders(['cookie']),
    })
    setSession(response.data)
  }

  if (to.path === LOGIN_PATH) {
    if (!user.value) return
    const raw = typeof to.query.redirect === 'string' ? to.query.redirect : ''
    return navigateTo(
      raw ? resolveRedirect(raw, user.value) : resolveHomePath(user.value.scope),
      { replace: true },
    )
  }

  if (!user.value)
    return navigateTo(`${LOGIN_PATH}?redirect=${encodeURIComponent(to.fullPath)}`)

  if (isRouteAllowed(to.path, user.value)) return

  // Scope/level akses tidak cocok untuk rute ini: kembalikan ke beranda pemilik sesi.
  return navigateTo(resolveHomePath(user.value.scope), { replace: true })
})
