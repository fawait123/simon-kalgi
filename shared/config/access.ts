import type { AccessLevel } from '@prisma/client'
import type { AuthUser, SessionScope } from '~~/shared/types/auth'

export const STAFF_SCOPES: readonly SessionScope[] = ['staff']
export const PATIENT_SCOPES: readonly SessionScope[] = ['patient']
export const ADMIN_ACCESS: readonly AccessLevel[] = ['admin']

export const STAFF_HOME = '/admin/dashboard'
export const PATIENT_HOME = '/pasien/dashboard'
export const LOGIN_PATH = '/login'

export interface RouteAccessRule {
  path: string
  /** Aturan 'exact' selalu mengalahkan 'prefix'; di antara dua 'prefix', yang paling panjang menang. */
  match: 'exact' | 'prefix'
  scopes: readonly SessionScope[]
  /** Hanya berlaku untuk scope 'staff'; kosong = semua level petugas. */
  accessLevels?: readonly AccessLevel[]
}

// Path yang TIDAK terdaftar di sini dianggap rute staf (fail-closed terhadap pasien).
export const routeAccessRules: readonly RouteAccessRule[] = [
  { path: '/', match: 'exact', scopes: ['staff', 'patient'] },
  // Seluruh prefix /pasien adalah milik portal pasien, sehingga rute portal baru ikut terbaca.
  { path: '/pasien', match: 'prefix', scopes: ['patient'] },
  { path: '/admin/pasien', match: 'prefix', scopes: STAFF_SCOPES, accessLevels: ADMIN_ACCESS },
  { path: '/admin/petugas', match: 'prefix', scopes: STAFF_SCOPES, accessLevels: ADMIN_ACCESS },
  { path: '/admin/edukasi', match: 'prefix', scopes: STAFF_SCOPES, accessLevels: ADMIN_ACCESS },
]

function normalizePath(input: string) {
  const withoutQuery = (input.split('?')[0] ?? '/').split('#')[0] ?? '/'
  const lowered = withoutQuery.toLowerCase()
  if (lowered === '/') return '/'
  return lowered.endsWith('/') ? lowered.slice(0, -1) : lowered
}

export function findRouteRule(path: string): RouteAccessRule | undefined {
  const target = normalizePath(path)
  return routeAccessRules
    .filter(rule => (rule.match === 'exact' ? rule.path === target : target === rule.path || target.startsWith(`${rule.path}/`)))
    .sort((a, b) => {
      if (a.match !== b.match) return a.match === 'exact' ? -1 : 1
      return b.path.length - a.path.length
    })[0]
}

export function isRouteAllowed(path: string, user: AuthUser | null): boolean {
  if (!user) return false
  const rule = findRouteRule(path)
  if (!rule) return user.scope === 'staff'
  if (!rule.scopes.includes(user.scope)) return false
  // rule.scopes tidak membuat TS menyimpulkan 'staff', jadi diperiksa lagi di sini.
  return rule.accessLevels ? user.scope === 'staff' && rule.accessLevels.includes(user.accessLevel) : true
}

export function resolveHomePath(scope: SessionScope) {
  return scope === 'patient' ? PATIENT_HOME : STAFF_HOME
}

export function resolveRedirect(target: string, user: AuthUser) {
  return isRouteAllowed(target, user) ? target : resolveHomePath(user.scope)
}
