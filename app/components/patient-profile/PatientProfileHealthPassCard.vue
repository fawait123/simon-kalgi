<script setup lang="ts">
import type { PatientProfileDto } from '~~/shared/types/patient-profile'
import { QrCode, Smile } from 'lucide-vue-next'

const props = defineProps<{ profile: PatientProfileDto }>()

const activeYear = new Date().getFullYear()
const validityLabel = `Berlaku s/d 31 Des ${activeYear}`
</script>

<template>
  <section class="flex flex-col gap-space-md overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 p-space-lg text-primary-foreground shadow-sm">
    <div class="flex items-start justify-between gap-space-sm">
      <div class="flex items-center gap-2.5">
        <span class="flex size-9 items-center justify-center rounded-lg bg-white/15">
          <Smile class="size-5" aria-hidden="true" />
        </span>
        <div class="flex flex-col">
          <span class="font-headline-sm text-headline-sm font-bold leading-tight">DentaCare Pro</span>
          <span class="font-caption text-caption uppercase tracking-widest opacity-80">Digital Health Pass</span>
        </div>
      </div>
      <span class="rounded-full bg-white/15 px-2.5 py-1 font-caption text-caption font-semibold uppercase tracking-wider">
        Active {{ activeYear }}
      </span>
    </div>

    <div class="flex items-end justify-between gap-space-md">
      <div class="flex flex-col gap-1">
        <span class="font-caption text-caption uppercase tracking-widest opacity-80">Nama Pasien</span>
        <span class="font-headline-sm text-headline-sm font-bold leading-tight">{{ props.profile.fullName }}</span>
        <span class="font-mono font-caption text-caption opacity-90">{{ props.profile.medicalRecordNo }}</span>
      </div>
      <div class="flex flex-col items-center gap-1 rounded-lg bg-white p-2 text-primary">
        <QrCode class="size-16" aria-hidden="true" />
        <span class="font-caption text-caption font-medium">Scan Check-in</span>
      </div>
    </div>

    <div class="flex items-center justify-between gap-space-sm border-t border-white/20 pt-space-sm font-caption text-caption opacity-90">
      <span>Klinik Utama Gigi &amp; Mulut</span>
      <span>{{ validityLabel }}</span>
    </div>
  </section>
</template>
