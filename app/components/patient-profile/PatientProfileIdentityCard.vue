<script setup lang="ts">
import type { PatientProfileDto } from '~~/shared/types/patient-profile'
import { BadgeCheck, Camera, Fingerprint } from 'lucide-vue-next'
import { useUpdatePatientProfileMutation } from '~/composables/queries/usePatientProfileQueries'
import { calcAge } from '~/lib/format'

const props = defineProps<{ profile: PatientProfileDto }>()

const mutation = useUpdatePatientProfileMutation()
const fileInput = ref<HTMLInputElement | null>(null)

const initials = computed(() =>
  props.profile.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? '')
    .join(''),
)

const age = computed(() => calcAge(props.profile.birthDate))
const genderLabel = computed(() => (props.profile.gender === 'L' ? 'Laki-laki' : 'Perempuan'))
const insuranceLabel = computed(() => {
  const active = props.profile.insuranceValidUntil && new Date(props.profile.insuranceValidUntil) >= new Date()
  const base = props.profile.insuranceType?.trim() || 'Pasien Umum'
  return active ? `${base} / Asuransi Aktif` : base
})

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file)
    return
  const reader = new FileReader()
  reader.onload = () => {
    mutation.mutate({ avatarUrl: String(reader.result) })
    // Reset agar file yang sama tetap bisa dipilih ulang.
    ;(event.target as HTMLInputElement).value = ''
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <section class="relative overflow-hidden rounded-xl bg-surface-card p-space-lg shadow-sm">
    <div
      class="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary-surface"
      aria-hidden="true"
    />
    <div class="relative flex flex-wrap items-center gap-space-lg">
      <div class="relative shrink-0">
        <Avatar class="size-20 border-2 border-border-subtle">
          <AvatarImage v-if="profile.avatarUrl" :src="profile.avatarUrl" :alt="profile.fullName" />
          <AvatarFallback class="bg-primary-surface font-headline-sm text-headline-sm text-primary">
            {{ initials }}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          class="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          aria-label="Ubah foto profil"
          :disabled="mutation.isPending.value"
          @click="fileInput?.click()"
        >
          <Camera class="size-3.5" aria-hidden="true" />
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="hidden"
          @change="onFileChange"
        >
      </div>

      <div class="flex min-w-0 flex-1 flex-col gap-1.5">
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="font-headline-md text-headline-md text-text-primary">{{ profile.fullName }}</h2>
          <span
            class="flex items-center gap-1 rounded-full bg-status-success-bg px-2 py-0.5 font-caption text-caption font-semibold text-status-success"
          >
            <BadgeCheck class="size-3.5" aria-hidden="true" />
            Terverifikasi
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 font-body-sm text-body-sm text-text-secondary">
          <span class="flex items-center gap-1.5">
            <span class="font-semibold text-text-primary">RM:</span>
            <span class="font-mono">{{ profile.medicalRecordNo }}</span>
          </span>
          <span aria-hidden="true">•</span>
          <span class="flex items-center gap-1.5">
            <Fingerprint class="size-4 text-text-muted" aria-hidden="true" />
            <span class="font-mono">NIK: {{ profile.nik }}</span>
          </span>
        </div>

        <div class="flex flex-wrap gap-2 pt-0.5">
          <span
            class="rounded-md bg-surface-container-low px-2.5 py-1 font-caption text-caption font-medium text-text-secondary"
          >
            {{ age !== null ? `${age} Tahun` : '-' }} · {{ genderLabel }}
          </span>
          <span
            class="rounded-md bg-primary-surface px-2.5 py-1 font-caption text-caption font-medium text-primary"
          >
            {{ insuranceLabel }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
