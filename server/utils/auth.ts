import type { H3Event } from 'h3'

export const SESSION_COOKIE_NAME = 'dentacare_session'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8
export const REMEMBER_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export interface SessionClaims {
  sub: string
  medicalId: string
  fullName: string
  iat: number
  exp: number
}

const textEncoder = new TextEncoder()
let cachedKey: Promise<CryptoKey> | null = null

function sessionSecret(): string {
  const configured = useRuntimeConfig().sessionSecret
  if (configured) return configured
  throw createError({
    statusCode: 500,
    statusMessage: 'Konfigurasi sesi tidak lengkap. Set NUXT_SESSION_SECRET di .env.',
  })
}

function hmacKey() {
  if (!cachedKey) {
    cachedKey = crypto.subtle.importKey(
      'raw',
      textEncoder.encode(sessionSecret()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
  }
  return cachedKey
}

function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function fromBase64Url(value: string) {
  const binary = atob(value.replaceAll('-', '+').replaceAll('_', '/'))
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index)
  return bytes
}

function encodeSegment(value: unknown) {
  return toBase64Url(textEncoder.encode(JSON.stringify(value)))
}

async function signSegment(data: string) {
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(), textEncoder.encode(data))
  return toBase64Url(new Uint8Array(signature))
}

function constantTimeEquals(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let index = 0; index < a.length; index++) diff |= a.charCodeAt(index) ^ b.charCodeAt(index)
  return diff === 0
}

export async function signSessionToken(
  claims: Omit<SessionClaims, 'iat' | 'exp'>,
  maxAge: number,
) {
  const issuedAt = Math.floor(Date.now() / 1000)
  const body = `${encodeSegment({ alg: 'HS256', typ: 'JWT' })}.${encodeSegment({
    ...claims,
    iat: issuedAt,
    exp: issuedAt + maxAge,
  })}`
  return `${body}.${await signSegment(body)}`
}

export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  const segments = token.split('.')
  if (segments.length !== 3) return null

  const [header, payload, providedSignature] = segments as [string, string, string]
  if (!constantTimeEquals(await signSegment(`${header}.${payload}`), providedSignature)) return null

  try {
    const claims = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payload)),
    ) as unknown as SessionClaims
    if (typeof claims.sub !== 'string' || typeof claims.exp !== 'number') return null
    if (claims.exp * 1000 <= Date.now()) return null
    return claims
  }
  catch {
    return null
  }
}

export function setSessionCookie(event: H3Event, token: string, maxAge: number) {
  setCookie(event, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge,
  })
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE_NAME, { path: '/' })
}

export async function readSessionClaims(event: H3Event): Promise<SessionClaims | null> {
  const token = getCookie(event, SESSION_COOKIE_NAME)
  if (!token) return null
  return await verifySessionToken(token)
}
