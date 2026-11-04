<script setup lang="ts">
import { CalendarDays, Plus } from 'lucide-vue-next'

defineProps<{
  fullName: string
  activePeriodYear?: number | null
  monthLabel?: string | null
}>()
</script>

<template>
  <div
    class="flex flex-col gap-space-md rounded-xl bg-surface-card p-space-lg shadow-sm lg:flex-row lg:items-center lg:justify-between">
    <div class="flex flex-col gap-1.5">
      <div class="flex flex-wrap items-center gap-2.5">
        <h1 class="text-headline-lg font-bold tracking-tight text-text-primary">
          Dashboard Monitoring Klinis
        </h1>
        <span v-if="activePeriodYear" class="flex items-center gap-1.5 text-label-sm font-semibold text-primary">
          <span class="relative flex size-2" aria-hidden="true">
            <span
              class="absolute inset-0 animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
            <span class="relative size-2 rounded-full bg-primary" />
          </span>
          Periode Aktif {{ activePeriodYear }}
        </span>
      </div>
      <p class="max-w-2xl text-body-md text-text-secondary">
        Selamat datang kembali, <span class="font-semibold text-text-primary">{{ fullName
          }}</span>. Berikut ikhtisar pemeriksaan oral hygiene dan rekam medis pasien hari ini.
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-space-sm">
      <span
v-if="monthLabel"
        class="flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-label-md font-semibold text-text-secondary">
        <CalendarDays class="size-4 text-primary" aria-hidden="true" />
        Bulan Ini ({{ monthLabel }})
      </span>
      <Button
type="button" class="gap-2 rounded-lg text-label-md shadow-sm"
        @click="navigateTo('/pemeriksaan')">
        <Plus class="size-4" aria-hidden="true" />
        Pemeriksaan Baru
      </Button>
    </div>
  </div>
</template>
