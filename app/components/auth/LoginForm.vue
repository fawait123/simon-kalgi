<script setup lang="ts">
import type { LoginInput, LoginRole } from '~~/shared/schemas/auth.schema'
import { toTypedSchema } from '@vee-validate/zod'
import { ArrowRight, Contact, Eye, EyeOff, Loader2, Lock } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { loginSchema } from '~~/shared/schemas/auth.schema'
import { loginRoleConfigs } from '~~/shared/types/auth'
import { useLoginMutation } from '~/composables/queries/useAuthQueries'

const props = defineProps<{ role: LoginRole }>()

const route = useRoute()
const loginMutation = useLoginMutation()
const showPassword = ref(false)

const config = computed(() => loginRoleConfigs[props.role])
const isPending = computed(() => loginMutation.isPending.value)
const errorMessage = computed(() => {
  const error = loginMutation.error.value as { data?: { message?: string }, statusMessage?: string } | null
  return loginMutation.isError.value
    ? error?.data?.message ?? error?.statusMessage ?? 'Gagal masuk. Silakan coba lagi.'
    : null
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(
    loginSchema.pick({ identifier: true, password: true, rememberMe: true }),
  ),
  initialValues: { identifier: '', password: '', rememberMe: true },
})

const onSubmit = handleSubmit((values) => {
  const body: LoginInput = { ...values, role: props.role }
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/petugas'
  loginMutation.mutate(body, { onSuccess: () => navigateTo(redirect) })
})

function notifyPasswordReset() {
  toast.info('Pengaturan ulang kata sandi diproses oleh administrator klinik.')
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <p
      v-if="errorMessage"
      role="alert"
      class="rounded-lg border border-error-container bg-status-danger-bg px-3 py-2.5 font-caption text-caption text-status-danger"
    >
      {{ errorMessage }}
    </p>

    <FormField v-slot="{ componentField }" name="identifier">
      <FormItem class="flex flex-col gap-1.5">
        <FormLabel class="font-label-md text-label-md">{{ config.identifierLabel }}</FormLabel>
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
            <Contact class="size-5" aria-hidden="true" />
          </span>
          <FormControl>
            <Input
              v-bind="componentField"
              type="text"
              autocomplete="username"
              :placeholder="config.placeholder"
              class="h-11 rounded-lg border-border-strong pl-11 font-body-md text-body-md"
            />
          </FormControl>
        </div>
        <FormMessage class="font-caption text-caption" />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="password">
      <FormItem class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <FormLabel class="font-label-md text-label-md">Kata Sandi Akun</FormLabel>
          <button
            type="button"
            class="font-caption text-caption font-medium text-primary transition-colors hover:text-primary-hover hover:underline"
            @click="notifyPasswordReset"
          >
            Lupa kata sandi?
          </button>
        </div>
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
            <Lock class="size-5" aria-hidden="true" />
          </span>
          <FormControl>
            <Input
              v-bind="componentField"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Masukkan kata sandi terdaftar"
              class="h-11 rounded-lg border-border-strong pl-11 pr-11 font-body-md text-body-md"
            />
          </FormControl>
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-muted outline-none transition-colors hover:text-text-secondary focus-visible:text-text-primary"
            :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" class="size-5" aria-hidden="true" />
            <Eye v-else class="size-5" aria-hidden="true" />
          </button>
        </div>
        <FormMessage class="font-caption text-caption" />
      </FormItem>
    </FormField>

    <FormField v-slot="{ value, handleChange }" name="rememberMe" type="checkbox">
      <FormItem class="flex items-center gap-space-sm">
        <FormControl>
          <Checkbox
            id="login-remember-me"
            :model-value="value"
            class="size-4 rounded border-border-strong data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            @update:model-value="handleChange($event as boolean)"
          />
        </FormControl>
        <Label for="login-remember-me" class="cursor-pointer font-body-sm text-body-sm font-normal text-text-secondary">
          Ingat sesi login pada perangkat ini (30 hari)
        </Label>
      </FormItem>
    </FormField>

    <div class="pt-1">
      <Button
        type="submit"
        class="h-12 w-full gap-2 rounded-xl bg-primary text-sm font-semibold shadow-md shadow-primary/25 transition hover:bg-primary-hover active:scale-[0.99] disabled:opacity-70"
        :disabled="isPending"
      >
        <span>{{ isPending ? 'Memverifikasi kredensial...' : config.cta }}</span>
        <Loader2 v-if="isPending" class="size-4 animate-spin" aria-hidden="true" />
        <ArrowRight v-else class="size-4" aria-hidden="true" />
      </Button>
    </div>
  </form>
</template>
