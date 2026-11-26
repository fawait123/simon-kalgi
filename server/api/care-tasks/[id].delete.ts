import { z } from 'zod'
import { STAFF_SCOPES } from '~~/shared/config/access'
import { handleApiError } from '~~/server/utils/errors'
import { careTaskService } from '~~/server/services/care-task.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireSession(event, { scopes: STAFF_SCOPES, action: 'menghapus tugas perawatan pasien' })
    const id = z.string().uuid('ID tugas perawatan tidak valid').parse(getRouterParam(event, 'id'))
    return { data: await careTaskService.remove(id) }
  } catch (error) {
    throw handleApiError(error)
  }
})
