import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

const uniqueFieldLabels: Record<string, string> = {
  nik: 'NIK',
  email: 'Email',
  username: 'Username',
  medicalId: 'ID Medis',
  medical_id: 'ID Medis',
}

function describeUniqueConstraint(target: unknown): string {
  if (Array.isArray(target)) {
    return target.map((field) => uniqueFieldLabels[String(field)] ?? String(field)).join(', ')
  }
  if (typeof target === 'string') {
    return uniqueFieldLabels[target] ?? target
  }
  return 'Data'
}

export function createApiError(statusCode: number, statusMessage: string, data?: unknown) {
  return createError({ statusCode, statusMessage, data })
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    const first = error.issues[0]
    return createApiError(400, String(first?.message ?? 'Data yang dikirim tidak valid.'), {
      issues: error.issues,
    })
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const fields = describeUniqueConstraint(error.meta?.target)
      return createApiError(409, `${fields} sudah terdaftar.`)
    }
    if (error.code === 'P2025') {
      return createApiError(404, 'Data tidak ditemukan.')
    }
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    return createApiError(400, 'Data yang dikirim tidak valid.')
  }
  return error
}
