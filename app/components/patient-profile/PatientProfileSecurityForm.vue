<script setup lang="ts">
import type { ChangePatientPasswordInput } from '~~/shared/schemas/patient-profile.schema'
import type { PatientProfileDto } from '~~/shared/types/patient-profile'
import { Check, Eye, EyeOff, Info, Lock, ShieldCheck } from 'lucide-vue-next'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { changePatientPasswordSchema } from '~~/shared/schemas/patient-profile.schema'
import { useChangePatientPasswordMutation } from '~/composables/queries/usePatientProfileQueries'

defineProps<{ profile: PatientProfileDto }>()

const mutation = useChangePatientPasswordMutation()

const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const passwordSchema = changePatientPasswordSchema.extend({
  confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
}).refine(values => values.newPassword === values.confirmPassword, {
  message: 'Konfirmasi kata sandi tidak sama',
  path: ['confirmPassword'],
})

const emptyValues = { currentPassword: '', newPassword: '', confirmPassword: '' }

const { handleSubmit, values, resetField } = useForm<typeof emptyValues, ChangePatientPasswordInput>({
  validationSchema: toTypedSchema(passwordSchema),
  initialValues: emptyValues,
})

const strengthRules = computed(() => [
  { label: 'Minimal 8 karakter', ok: (values.newPassword ?? '').length >= 8 },
  { label: 'Mengandung huruf besar', ok: /[A-Z]/.test(values.newPassword ?? '') },
  { label: 'Mengandung angka', ok: /\d/.test(values.newPassword ?? '') },
  { label: 'Mengandung karakter khusus (#, @, !, ...)', ok: /[^A-Za-z0-9]/.test(values.newPassword ?? '') },
])

const securityScoreLabel = computed(() => {
  const passed = strengthRules.value.filter(rule => rule.ok).length
  if (passed >= 4) return { text: 'Sangat Baik', tone: 'bg-status-success-bg text-status-success' }
  if (passed >= 2) return { text: 'Cukup', tone: 'bg-status-warning-bg text-status-warning' }
  return { text: 'Perlu Diperbarui', tone: 'bg-status-danger-bg text-status-danger' }
})

const onSubmit = handleSubmit(({ currentPassword, newPassword }) => {
  mutation.mutate({ currentPassword, newPassword }, {
    onSuccess: () => {
      resetField('currentPassword')
      resetField('newPassword')
      resetField('confirmPassword')
    },
  })
})
</script>

<template>
  <section class="flex flex-col gap-space-lg rounded-xl bg-surface-card p-space-lg shadow-sm">
    <div class="flex flex-wrap items-start justify-between gap-space-sm border-b border-border-subtle pb-2">
      <div class="flex items-start gap-space-sm">
        <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-surface text-primary">
          <ShieldCheck class="size-5" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <h3 class="font-headline-sm text-headline-sm text-text-primary">Keamanan Akun Portal Pasien</h3>
          <p class="font-caption text-caption text-text-muted">
            Kelola kata sandi untuk proteksi data rekam medis Anda di DentaCare Pro.
          </p>
        </div>
      </div>
      <span
        class="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-caption text-caption font-semibold"
        :class="securityScoreLabel.tone"
      >
        <ShieldCheck class="size-3.5" aria-hidden="true" />
        Skor Keamanan: {{ securityScoreLabel.text }}
      </span>
    </div>

    <div
      v-if="!profile.portalEnabled"
      class="flex items-start gap-2.5 rounded-lg border border-status-info/20 bg-status-info-bg p-space-sm"
    >
      <Info class="mt-0.5 size-5 shrink-0 text-status-info" aria-hidden="true" />
      <p class="font-caption text-caption text-text-secondary">
        Akun portal Anda belum diaktifkan. Hubungi administrator klinik untuk membuat kata sandi pertama Anda.
      </p>
    </div>

    <form v-else class="flex flex-col gap-space-md" @submit.prevent="onSubmit">
      <div class="flex items-center gap-2 border-b border-border-subtle pb-1.5">
        <Lock class="size-4 text-primary" aria-hidden="true" />
        <h4 class="font-label-md text-label-md font-semibold text-text-primary">Ubah Kata Sandi Akun Portal</h4>
      </div>

      <FormField v-slot="{ componentField, value }" name="currentPassword">
        <FormItem class="flex flex-col gap-1.5">
          <FormLabel class="font-label-md text-label-md">Kata Sandi Saat Ini</FormLabel>
          <FormControl>
            <div class="relative">
              <Input
                v-bind="componentField" :model-value="value"
                :type="showCurrent ? 'text' : 'password'" autocomplete="current-password"
                class="h-10 rounded-lg pr-10"
              />
              <button
                type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                :aria-label="showCurrent ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                @click="showCurrent = !showCurrent"
              >
                <Eye v-if="!showCurrent" class="size-4" aria-hidden="true" />
                <EyeOff v-else class="size-4" aria-hidden="true" />
              </button>
            </div>
          </FormControl>
          <FormMessage class="font-caption text-caption" />
        </FormItem>
      </FormField>

      <div class="grid grid-cols-1 gap-space-md sm:grid-cols-2">
        <FormField v-slot="{ componentField, value }" name="newPassword">
          <FormItem class="flex flex-col gap-1.5">
            <FormLabel class="font-label-md text-label-md">Kata Sandi Baru</FormLabel>
            <FormControl>
              <div class="relative">
                <Input
                  v-bind="componentField" :model-value="value"
                  :type="showNew ? 'text' : 'password'" autocomplete="new-password"
                  class="h-10 rounded-lg pr-10"
                />
                <button
                  type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  :aria-label="showNew ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                  @click="showNew = !showNew"
                >
                  <Eye v-if="!showNew" class="size-4" aria-hidden="true" />
                  <EyeOff v-else class="size-4" aria-hidden="true" />
                </button>
              </div>
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, value }" name="confirmPassword">
          <FormItem class="flex flex-col gap-1.5">
            <FormLabel class="font-label-md text-label-md">Konfirmasi Kata Sandi Baru</FormLabel>
            <FormControl>
              <div class="relative">
                <Input
                  v-bind="componentField" :model-value="value"
                  :type="showConfirm ? 'text' : 'password'" autocomplete="new-password"
                  class="h-10 rounded-lg pr-10"
                />
                <button
                  type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  :aria-label="showConfirm ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                  @click="showConfirm = !showConfirm"
                >
                  <Eye v-if="!showConfirm" class="size-4" aria-hidden="true" />
                  <EyeOff v-else class="size-4" aria-hidden="true" />
                </button>
              </div>
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>
      </div>

      <ul class="flex flex-col gap-1">
        <li
          v-for="rule in strengthRules"
          :key="rule.label"
          class="flex items-center gap-1.5 font-caption text-caption"
          :class="rule.ok ? 'text-status-success' : 'text-text-muted'"
        >
          <Check class="size-3.5" :class="rule.ok ? '' : 'opacity-0'" aria-hidden="true" />
          {{ rule.label }}
        </li>
      </ul>

      <div class="flex justify-end border-t border-border-subtle pt-space-md">
        <Button type="submit" class="gap-1.5 rounded-lg font-label-md text-label-md" :disabled="mutation.isPending.value">
          <Lock class="size-4" aria-hidden="true" />
          {{ mutation.isPending.value ? 'Memperbarui…' : 'Perbarui Kata Sandi' }}
        </Button>
      </div>
    </form>
  </section>
</template>
