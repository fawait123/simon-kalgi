<script setup lang="ts">
import type { PatientProfileDto } from '~~/shared/types/patient-profile'
import { CalendarClock, CheckCircle2, History, TrendingUp } from 'lucide-vue-next'
import { formatDateId, formatVisitSchedule } from '~/lib/format'

const props = defineProps<{ profile: PatientProfileDto }>()

const ohisLabel = computed(() =>
  props.profile.ohisScore === null ? '-' : props.profile.ohisScore.toFixed(2),
)

const ohisCategoryLabel = computed(() => {
  switch (props.profile.ohisCategory) {
    case 'baik': return 'Baik'
    case 'sedang': return 'Sedang'
    case 'buruk': return 'Buruk'
    default: return 'Belum terukur'
  }
})

const ohisTone = computed(() => {
  switch (props.profile.ohisCategory) {
    case 'baik': return 'text-status-success'
    case 'buruk': return 'text-status-danger'
    default: return 'text-status-warning'
  }
})

const nextVisitSchedule = computed(() => {
  if (!props.profile.nextVisitAt)
    return null
  const time = new Date(props.profile.nextVisitAt)
  const hours = Number.isNaN(time.getTime())
    ? ''
    : ` Pukul ${String(time.getHours()).padStart(2, '0')}.${String(time.getMinutes()).padStart(2, '0')} WIB`
  return `${formatVisitSchedule(props.profile.nextVisitAt)}${hours} - ${props.profile.nextVisitClinician ?? 'dokter jaga'}`
})
</script>

<template>
  <section class="flex flex-col gap-space-md rounded-xl bg-surface-card p-space-lg shadow-sm">
    <div class="flex items-center gap-2 border-b border-border-subtle pb-2">
      <TrendingUp class="size-5 text-primary" aria-hidden="true" />
      <h3 class="font-headline-sm text-headline-sm text-text-primary">Statistik Perawatan</h3>
    </div>

    <div class="grid grid-cols-2 gap-space-sm">
      <div class="flex flex-col gap-0.5 rounded-lg bg-surface-container-low p-space-md">
        <span class="font-caption text-caption text-text-muted">Total Kunjungan</span>
        <span class="font-headline-lg text-headline-lg font-bold leading-none text-text-primary">
          {{ profile.totalVisits }}
        </span>
        <span class="font-caption text-caption font-medium text-primary">Riwayat Lengkap</span>
      </div>
      <div class="flex flex-col gap-0.5 rounded-lg bg-surface-container-low p-space-md">
        <span class="font-caption text-caption text-text-muted">Skor OHI-S</span>
        <span class="font-headline-lg text-headline-lg font-bold leading-none" :class="ohisTone">
          {{ ohisLabel }}
        </span>
        <span class="font-caption text-caption font-medium" :class="ohisTone">{{ ohisCategoryLabel }}</span>
      </div>
    </div>

    <div class="flex items-start gap-space-sm rounded-lg bg-surface-container-low p-space-md">
      <History class="mt-0.5 size-5 shrink-0 text-text-secondary" aria-hidden="true" />
      <div class="flex min-w-0 flex-col gap-0.5">
        <span class="font-caption text-caption text-text-muted">Kunjungan Terakhir</span>
        <span class="font-label-md text-label-md font-semibold text-text-primary">
          {{ profile.lastVisitAt ? formatDateId(profile.lastVisitAt) : 'Belum ada kunjungan' }}
        </span>
        <span class="font-body-sm text-body-sm text-text-secondary">
          {{ profile.controlTitle ?? 'Pemeriksaan dan pembersihan rutin' }}
        </span>
      </div>
    </div>

    <div class="flex items-start gap-space-sm rounded-lg bg-primary-surface p-space-md">
      <CalendarClock class="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
      <div class="flex min-w-0 flex-col gap-0.5">
        <span class="flex flex-wrap items-center gap-1.5 font-caption text-caption text-text-muted">
          Kontrol Berikutnya
          <span
            v-if="profile.nextVisitAt"
            class="flex items-center gap-1 rounded-full bg-status-success-bg px-1.5 py-0.5 font-semibold text-status-success"
          >
            <CheckCircle2 class="size-3" aria-hidden="true" />
            Terkonfirmasi
          </span>
        </span>
        <template v-if="profile.nextVisitAt">
          <span class="font-label-md text-label-md font-semibold text-primary">
            {{ formatDateId(profile.nextVisitAt) }}
          </span>
          <span class="font-body-sm text-body-sm text-text-secondary">{{ nextVisitSchedule }}</span>
        </template>
        <span v-else class="font-body-sm text-body-sm text-text-secondary">
          Belum ada jadwal kontrol. Dokter akan menentukannya pada kunjungan berikutnya.
        </span>
      </div>
    </div>
  </section>
</template>
