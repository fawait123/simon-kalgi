import type { PatientEducationQuery } from '~~/shared/schemas/education.schema'
import type { EducationArticleDto } from '~~/shared/types/education'
import { useQuery } from '@tanstack/vue-query'
import { patientEducationKeys } from '~/lib/query-keys'

export function usePatientEducationsQuery(params: () => PatientEducationQuery) {
  return useQuery({
    queryKey: computed(() => patientEducationKeys.list(params())),
    queryFn: () => $fetch<{ data: EducationArticleDto[], meta: { page: number, pageSize: number, total: number } }>('/api/patient-care/educations', { query: params() }),
  })
}

export function usePatientEducationDetailQuery(id: () => string | null) {
  const resolvedId = computed(id)
  return useQuery({
    queryKey: computed(() => patientEducationKeys.detail(resolvedId.value ?? '')),
    queryFn: () => $fetch<{ data: EducationArticleDto }>(`/api/patient-care/educations/${resolvedId.value}`),
    enabled: computed(() => Boolean(resolvedId.value)),
  })
}
