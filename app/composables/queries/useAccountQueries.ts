import type { UpdateAccountProfileInput } from '~~/shared/schemas/account.schema'
import type { AccountPasswordChangeDto, AccountProfileDto, AccountStatsDto } from '~~/shared/types/account'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { useAuthSession } from '~/composables/useAuthSession'
import { accountKeys, healthWorkerKeys } from '~/lib/query-keys'

function errorMessage(error: unknown, fallback: string) {
  const message = (error as { data?: { message?: string }; statusMessage?: string })?.data
    ?.message
    ?? (error as { statusMessage?: string })?.statusMessage
  return message ?? fallback
}

export function useAccountProfileQuery() {
  return useQuery({
    queryKey: accountKeys.profile(),
    queryFn: () => $fetch<{ data: AccountProfileDto }>('/api/account/profile'),
    enabled: import.meta.client,
    staleTime: 60_000,
  })
}

export function useAccountStatsQuery() {
  return useQuery({
    queryKey: accountKeys.stats(),
    queryFn: () => $fetch<{ data: AccountStatsDto }>('/api/account/stats'),
    enabled: import.meta.client,
    staleTime: 30_000,
  })
}

export function useUpdateAccountProfileMutation() {
  const queryClient = useQueryClient()
  const { user, setSession } = useAuthSession()

  return useMutation({
    mutationFn: (body: UpdateAccountProfileInput) =>
      $fetch<{ data: AccountProfileDto }>('/api/account/profile', { method: 'PATCH', body }),
    onSuccess: ({ data: profile }) => {
      queryClient.setQueryData(accountKeys.profile(), { data: profile })
      queryClient.invalidateQueries({ queryKey: accountKeys.stats() })
      queryClient.invalidateQueries({ queryKey: healthWorkerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: healthWorkerKeys.stats() })
      if (user.value) {
        setSession({
          ...user.value,
          fullName: profile.fullName,
          email: profile.email,
          role: profile.role,
          specialization: profile.specialization,
          accessLevel: profile.accessLevel,
          status: profile.status,
          isPic: profile.isPic,
          avatarUrl: profile.avatarUrl,
        })
      }
      toast.success('Profil akun berhasil diperbarui.')
    },
    onError: error => toast.error(errorMessage(error, 'Gagal menyimpan perubahan profil.')),
  })
}

export function useChangeAccountPasswordMutation() {
  return useMutation({
    mutationFn: (body: { currentPassword: string, newPassword: string }) =>
      $fetch<{ data: AccountPasswordChangeDto }>('/api/account/password', {
        method: 'PATCH',
        body,
      }),
    onSuccess: () => toast.success('Kata sandi berhasil diperbarui.'),
    onError: error => toast.error(errorMessage(error, 'Gagal mengganti kata sandi.')),
  })
}
