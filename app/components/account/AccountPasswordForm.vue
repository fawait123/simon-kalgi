<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { KeyRound, ShieldCheck } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { changeAccountPasswordSchema } from '~~/shared/schemas/account.schema'
import { useChangeAccountPasswordMutation } from '~/composables/queries/useAccountQueries'

const passwordSchema = changeAccountPasswordSchema
  .extend({
    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi baru'),
  })
  .refine(values => values.newPassword === values.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak sama dengan kata sandi baru.',
    path: ['confirmPassword'],
  })

const emptyValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

const mutation = useChangeAccountPasswordMutation()
const { handleSubmit, meta, resetForm, values } = useForm<typeof emptyValues>({
  validationSchema: toTypedSchema(passwordSchema),
  initialValues: emptyValues,
})

const checks = computed(() => {
  const value = String(values.newPassword ?? '')
  return [
    { label: 'Minimal 8 karakter', passed: value.length >= 8 },
    { label: 'Huruf besar & kecil', passed: /[a-z]/.test(value) && /[A-Z]/.test(value) },
    { label: 'Mengandung angka', passed: /\d/.test(value) },
    { label: 'Mengandung simbol', passed: /[^A-Za-z0-9]/.test(value) },
  ]
})

const strengthScore = computed(() => checks.value.filter(item => item.passed).length)
const strengthLabel = computed(() => {
  if (strengthScore.value <= 1) return 'Lemah'
  if (strengthScore.value <= 3) return 'Sedang'
  return 'Kuat'
})
const strengthClass = computed(() => {
  if (strengthScore.value <= 1) return 'text-status-danger'
  if (strengthScore.value <= 3) return 'text-status-warning'
  return 'text-status-success'
})

const isPristine = computed(() =>
  !values.currentPassword && !values.newPassword && !values.confirmPassword,
)
const hasChanges = computed(() => meta.value.dirty && !isPristine.value)

const onSubmit = handleSubmit((formValues) => {
  mutation.mutate(
    { currentPassword: formValues.currentPassword, newPassword: formValues.newPassword },
    { onSuccess: () => resetForm({ values: emptyValues }) },
  )
})

function submit() {
  if (!hasChanges.value)
    return false
  void onSubmit()
  return true
}

defineExpose({ hasChanges, isSaving: mutation.isPending, submit })
</script>

<template>
  <form class="flex flex-col gap-space-lg rounded-xl bg-surface-card p-space-lg shadow-sm" @submit.prevent="submit">
    <div class="flex items-center gap-space-sm border-b border-border-subtle pb-2">
      <span
        class="flex size-6 items-center justify-center rounded-full bg-primary font-label-sm text-label-sm text-primary-foreground"
      >
        <KeyRound class="size-3.5" aria-hidden="true" />
      </span>
      <div class="min-w-0">
        <h3 class="font-headline-sm text-headline-sm text-text-primary">Keamanan Kata Sandi</h3>
        <p class="font-caption text-caption text-text-muted">
          Ganti kredensial login modul monitoring. Sesi aktif di perangkat lain tidak dikeluarkan.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-space-md sm:grid-cols-2">
      <FormField v-slot="{ componentField }" name="currentPassword">
        <FormItem class="flex flex-col gap-1.5">
          <FormLabel class="font-label-md text-label-md">Kata Sandi Saat Ini</FormLabel>
          <FormControl>
            <Input
v-bind="componentField" type="password" autocomplete="current-password"
              class="h-10 rounded-lg sm:col-span-2" />
          </FormControl>
          <FormMessage class="font-caption text-caption" />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="newPassword">
        <FormItem class="flex flex-col gap-1.5">
          <FormLabel class="font-label-md text-label-md">Kata Sandi Baru</FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="password" autocomplete="new-password" class="h-10 rounded-lg" />
          </FormControl>
          <div class="flex items-center gap-2">
            <div class="flex flex-1 gap-1" role="img" :aria-label="`Kekuatan kata sandi: ${strengthLabel}`">
              <span
                v-for="segment in 4"
                :key="segment"
                class="h-1.5 flex-1 rounded-full bg-border-subtle transition-colors"
                :class="segment <= strengthScore
                  ? strengthScore <= 1 ? 'bg-status-danger' : strengthScore <= 3 ? 'bg-status-warning' : 'bg-status-success'
                  : ''"
              />
            </div>
            <span class="font-label-sm text-label-sm" :class="strengthClass">{{ strengthLabel }}</span>
          </div>
          <ul class="flex flex-wrap gap-x-3 gap-y-1">
            <li
              v-for="check in checks"
              :key="check.label"
              class="flex items-center gap-1 font-caption text-caption"
              :class="check.passed ? 'text-status-success' : 'text-text-muted'"
            >
              <ShieldCheck class="size-3" aria-hidden="true" />
              {{ check.label }}
            </li>
          </ul>
          <FormMessage class="font-caption text-caption" />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="confirmPassword">
        <FormItem class="flex flex-col gap-1.5">
          <FormLabel class="font-label-md text-label-md">Konfirmasi Kata Sandi Baru</FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="password" autocomplete="new-password" class="h-10 rounded-lg" />
          </FormControl>
          <FormMessage class="font-caption text-caption" />
        </FormItem>
      </FormField>
    </div>

    <div class="flex flex-wrap items-center justify-end gap-space-sm border-t border-border-subtle pt-space-md">
      <p class="mr-auto font-caption text-caption text-text-muted">
        Kata sandi disimpan sebagai hash bcrypt dan tidak pernah ditampilkan kembali.
      </p>
      <Button
type="button" variant="outline" class="rounded-lg font-label-md text-label-md"
        @click="resetForm({ values: emptyValues })">
        Kosongkan
      </Button>
      <Button
type="submit" class="font-label-md text-label-md"
        :disabled="mutation.isPending.value || isPristine">
        {{ mutation.isPending.value ? 'Menyimpan…' : 'Perbarui Kata Sandi' }}
      </Button>
    </div>
  </form>
</template>
