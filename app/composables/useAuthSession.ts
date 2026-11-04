import type { AuthUser } from '~~/shared/types/auth'

export function useAuthSession() {
  const user = useState<AuthUser | null>('auth-user', () => null)

  function setSession(value: AuthUser | null) {
    user.value = value
  }

  return {
    user,
    scope: computed(() => user.value?.scope),
    isStaff: computed(() => user.value?.scope === 'staff'),
    isPatient: computed(() => user.value?.scope === 'patient'),
    isLoggedIn: computed(() => user.value !== null),
    setSession,
  }
}
