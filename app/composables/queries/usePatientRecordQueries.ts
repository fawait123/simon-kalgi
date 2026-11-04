import type { ExaminationDetailDto } from '~~/shared/types/examination'
import type { PatientExamSessionListDto } from '~~/shared/types/patient-record'
import { useQuery } from '@tanstack/vue-query'
import { patientRecordKeys } from '~/lib/query-keys'

export function usePatientExamSessionsQuery() {
  return useQuery({
    queryKey: patientRecordKeys.sessions(),
    queryFn: () => $fetch<PatientExamSessionListDto>('/api/patient-care/examinations'),
  })
}

/**
 * `enabled` menahan request selama belum ada sesi terpilih, sehingga pasien tanpa rekam medis
 * final tidak memicu request dengan `id` kosong.
 */
export function usePatientExamDetailQuery(examinationId: () => string | null) {
  return useQuery({
    queryKey: computed(() => patientRecordKeys.detail(examinationId() ?? '')),
    queryFn: () =>
      $fetch<{ data: ExaminationDetailDto }>(
        `/api/patient-care/examinations/${examinationId()}`,
      ),
    enabled: computed(() => Boolean(examinationId())),
  })
}
