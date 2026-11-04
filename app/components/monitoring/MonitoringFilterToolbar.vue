<script setup lang="ts">
import type {
  MonitoringOhisFilter,
  MonitoringScheduleRangeFilter,
  MonitoringStatus,
  MonitoringStatusFilter,
} from '~~/shared/schemas/monitoring.schema'
import { CalendarClock, HeartPulse, RotateCcw, Search, ShieldCheck } from 'lucide-vue-next'
import { monitoringStatusFilterOptions } from '~~/shared/types/monitoring'

const search = defineModel<string>('search', { required: true })
const status = defineModel<MonitoringStatusFilter>('status', { required: true })
const ohis = defineModel<MonitoringOhisFilter>('ohis', { required: true })
const schedule = defineModel<MonitoringScheduleRangeFilter>('schedule', { required: true })

const emits = defineEmits<{ reset: [] }>()

const ohisOptions = [
  { value: 'all', label: 'Semua Kategori OHI-S' },
  { value: 'baik', label: 'Baik (\u2264 1.2)' },
  { value: 'sedang', label: 'Sedang (\u2264 3.0)' },
  { value: 'buruk', label: 'Buruk (> 3.0)' },
] as const

const scheduleOptions = [
  { value: 'all', label: 'Semua Jadwal' },
  { value: 'week', label: 'Kontrol 7 Hari ke Depan' },
  { value: 'month', label: 'Kontrol 30 Hari ke Depan' },
] as const

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  ...monitoringStatusFilterOptions.map((option: { value: MonitoringStatus, label: string }) => ({
    value: option.value as MonitoringStatusFilter,
    label: option.label,
  })),
]
</script>

<template>
  <div
    class="flex flex-col items-stretch justify-between gap-space-md rounded-xl bg-surface-card p-space-md shadow-sm lg:flex-row lg:items-center"
  >
    <div class="relative min-w-[260px] flex-1">
      <label for="monitoring-search" class="sr-only">Cari pasien dalam pemantauan</label>
      <Search
        class="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-text-muted"
        aria-hidden="true"
      />
      <Input
        id="monitoring-search"
        v-model="search"
        type="search"
        autocomplete="off"
        placeholder="Cari nama pasien, No. RM, atau dokter pendamping..."
        class="h-10 rounded-lg bg-bg-canvas pl-9 font-body-sm text-body-sm placeholder:text-text-muted"
      />
    </div>

    <div class="flex flex-wrap items-center gap-2.5">
      <div class="min-w-[178px]">
        <Select v-model="status">
          <SelectTrigger
            id="monitoring-status-filter"
            class="h-10 rounded-lg bg-bg-canvas font-body-sm text-body-sm text-text-secondary"
            aria-label="Filter status kepatuhan"
          >
            <ShieldCheck class="size-[18px] text-text-muted" aria-hidden="true" />
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="min-w-[196px]">
        <Select v-model="ohis">
          <SelectTrigger
            id="monitoring-ohis-filter"
            class="h-10 rounded-lg bg-bg-canvas font-body-sm text-body-sm text-text-secondary"
            aria-label="Filter kategori OHI-S"
          >
            <HeartPulse class="size-[18px] text-text-muted" aria-hidden="true" />
            <SelectValue placeholder="Semua Kategori OHI-S" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in ohisOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="min-w-[200px]">
        <Select v-model="schedule">
          <SelectTrigger
            id="monitoring-schedule-filter"
            class="h-10 rounded-lg bg-bg-canvas font-body-sm text-body-sm text-text-secondary"
            aria-label="Filter rentang jadwal kontrol"
          >
            <CalendarClock class="size-[18px] text-text-muted" aria-hidden="true" />
            <SelectValue placeholder="Semua Jadwal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in scheduleOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="ghost"
        class="h-10 shrink-0 gap-1.5 rounded-lg font-body-sm text-body-sm text-text-muted hover:bg-bg-canvas hover:text-text-primary"
        @click="emits('reset')"
      >
        <RotateCcw class="size-[18px]" aria-hidden="true" />
        <span class="hidden sm:inline">Reset</span>
      </Button>
    </div>
  </div>
</template>
