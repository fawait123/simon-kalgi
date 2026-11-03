import type { LoginInput } from '~~/shared/schemas/auth.schema'
import type { LoginResponse, LogoutResponse } from '~~/shared/types/auth'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'

function authErrorMessage(error: unknown) {
  const typed = error as { data?: { message?: string }, statusMessage?: string } | null
  return typed?.data?.message ?? typed?.statusMessage ?? 'Terjadi kesalahan. Silakan coba lagi.'
}

export function useLoginMutation() {
  const { setSession } = useAuthSession()

  return useMutation({
    mutationFn: (body: LoginInput) => $fetch<LoginResponse>('/api/auth/login', { method: 'POST', body }),
    onSuccess: (response) => {
      setSession(response.data)
      toast.success(`Selamat datang, ${response.data.fullName}.`)
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const { setSession } = useAuthSession()

  return useMutation({
    mutationFn: () => $fetch<LogoutResponse>('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      setSession(null)
      queryClient.clear()
      toast.success('Anda telah keluar dari sistem.')
      navigateTo('/login')
    },
    onError: error => toast.error(authErrorMessage(error)),
  })
}
