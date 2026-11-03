import { clearSessionCookie } from '~~/server/utils/auth'

export default defineEventHandler((event) => {
  clearSessionCookie(event)
  return { data: { status: 'logged-out' } }
})
