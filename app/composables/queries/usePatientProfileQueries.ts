import type { ChangePatientPasswordInput, UpdatePatientProfileInput } from '~~/shared/schemas/patient-profile.schema'
import type { PatientProfileDto } from '~~/shared/types/patient-profile'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { patientProfileKeys } from '~/lib/query-keys'

function errorMessage(error: unknown, fallback: string) {
  const message = (error as { data?: { message?: string }; statusMessage?: string })?.data
    ?.message
    ?? (error as { statusMessage?: string })?.statusMessage
  return message ?? fallback
}

export function usePatientProfileQuery() {
  return useQuery({
    queryKey: patientProfileKeys.profile(),
    queryFn: () => $fetch<{ data: PatientProfileDto }>('/api/patient-profile'),
    enabled: import.meta.client,
    staleTime: 60_000,
  })
}

export function useUpdatePatientProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdatePatientProfileInput) =>
      $fetch<{ data: PatientProfileDto }>('/api/patient-profile', { method: 'PATCH', body }),
    onSuccess: ({ data: profile }) => {
      queryClient.setQueryData(patientProfileKeys.profile(), { data: profile })
      toast.success('Perubahan profil berhasil disimpan.')
    },
    onError: error => toast.error(errorMessage(error, 'Gagal menyimpan perubahan profil.')),
  })
}

export function useChangePatientPasswordMutation() {
  return useMutation({
    mutationFn: (body: ChangePatientPasswordInput) =>
      $fetch<{ data: { changedAt: string } }>('/api/patient-profile/password', {
        method: 'PATCH',
        body,
      }),
    onSuccess: () => toast.success('Kata sandi berhasil diperbarui.'),
    onError: error => toast.error(errorMessage(error, 'Gagal mengganti kata sandi.')),
  })
}
