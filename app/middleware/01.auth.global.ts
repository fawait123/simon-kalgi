import type { AuthSessionResponse } from '~~/shared/types/auth'

const LOGIN_PATH = '/login'
const HOME_PATH = '/petugas'

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, setSession } = useAuthSession()

  if (import.meta.server) {
    const response = await $fetch<AuthSessionResponse>('/api/auth/me', {
      headers: useRequestHeaders(['cookie']),
    })
    setSession(response.data)
  }

  if (to.path === LOGIN_PATH) {
    if (!user.value) return
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : HOME_PATH
    return navigateTo(redirect)
  }

  if (!user.value)
    return navigateTo(`${LOGIN_PATH}?redirect=${encodeURIComponent(to.fullPath)}`)
})
