<script setup lang="ts">
import type { CareDayDto, CareSessionFilter } from '~~/shared/types/care'
import { careSessionLabel, careTaskSessionOrder } from '~~/shared/types/care'
import { CheckCircle2, Circle, Clock } from 'lucide-vue-next'

const props = defineProps<{
  days: CareDayDto[]
  selectedDate: string
  sessionFilter: CareSessionFilter
}>()

const emit = defineEmits<{
  select: [date: string]
  filter: [session: CareSessionFilter]
}>()

const filterOptions = computed<readonly { value: CareSessionFilter, label: string }[]>(() => [
  { value: 'all', label: 'Semua Waktu' },
  ...careTaskSessionOrder.map(session => ({ value: session, label: careSessionLabel[session] })),
])

function stateIcon(day: CareDayDto) {
  if (day.state === 'complete') return CheckCircle2
  if (day.state === 'partial') return Clock
  return Circle
}
</script>

<template>
  <div class="flex flex-col gap-space-md rounded-xl border border-border-subtle bg-surface-card p-space-md shadow-sm">
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      <button
        v-for="day in props.days"
        :key="day.date"
        type="button"
        class="flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 transition-colors"
        :class="day.date === props.selectedDate
          ? 'border-primary bg-primary-surface'
          : 'border-border-subtle bg-bg-canvas hover:border-border-strong'"
        :aria-pressed="day.date === props.selectedDate"
        :aria-current="day.isToday ? 'date' : undefined"
        :disabled="day.isFuture"
        :title="day.total > 0 ? `${day.done} dari ${day.total} tugas` : 'Belum ada tugas pada hari ini'"
        @click="emit('select', day.date)"
      >
        <span class="font-label-sm text-label-sm uppercase tracking-wide text-text-muted">
          {{ day.weekdayLabel }}
        </span>
        <span class="font-headline-sm text-headline-sm text-text-primary">{{ day.dayNumber }}</span>
        <component
          :is="stateIcon(day)"
          class="size-4"
          :class="day.state === 'complete' ? 'text-status-success' : day.state === 'partial' ? 'text-status-warning' : 'text-text-muted'"
          aria-hidden="true"
        />
        <span
          v-if="day.state === 'partial'"
          class="rounded-full bg-status-warning-bg px-1.5 py-0.5 font-label-sm text-label-sm text-status-warning"
        >
          {{ day.done }}/{{ day.total }}
        </span>
      </button>
    </div>

    <div class="flex flex-wrap gap-2" role="group" aria-label="Saring tugas berdasarkan sesi waktu">
      <button
        v-for="option in filterOptions"
        :key="option.value"
        type="button"
        class="rounded-full border px-3 py-1.5 font-label-md text-label-md transition-colors"
        :class="props.sessionFilter === option.value
          ? 'border-primary-container bg-primary-container text-primary-foreground'
          : 'border-border-subtle bg-surface-card text-text-secondary hover:bg-surface-container-low'"
        :aria-pressed="props.sessionFilter === option.value"
        @click="emit('filter', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
