import { patientListQuerySchema } from '~~/shared/schemas/patient.schema'
import { STAFF_SCOPES } from '~~/shared/config/access'
import { handleApiError } from '~~/server/utils/errors'
import { patientService } from '~~/server/services/patient.service'
import { requireSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (data) => patientListQuerySchema.parse(data))
  try {
    // Sengaja tanpa `accessLevels`: daftar pasien dibutuhkan pemilih pasien di /pemeriksaan
    // (ExaminationPatientPicker) dan dialog jadwal kontrol di /monitoring untuk semua petugas.
    await requireSession(event, { scopes: STAFF_SCOPES, action: 'membuka daftar pasien' })
    return await patientService.list(query)
  } catch (error) {
    throw handleApiError(error)
  }
})
