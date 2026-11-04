<script setup lang="ts">
import type { AccountStatsDto } from '~~/shared/types/account'
import { CalendarClock } from 'lucide-vue-next'
import {
  strStatusBarClass,
  strStatusBadgeClass,
  strStatusLabel,
} from '~~/shared/types/account'

const props = defineProps<{ stats: AccountStatsDto | null }>()

const barWidth = computed(() => `${props.stats?.strValidityPercent ?? 0}%`)
</script>

<template>
  <section class="flex flex-col gap-space-md rounded-xl bg-surface-card p-space-md shadow-sm">
    <div class="flex items-center gap-2">
      <span class="flex size-8 items-center justify-center rounded-lg bg-primary-surface text-primary">
        <CalendarClock class="size-4" aria-hidden="true" />
      </span>
      <h3 class="font-label-md text-label-md font-semibold uppercase tracking-wider text-text-secondary">
        Sisa Masa Aktif STR
      </h3>
    </div>

    <template v-if="props.stats">
      <p class="flex items-baseline gap-1.5">
        <span class="font-metric-display text-metric-display text-text-primary">{{ props.stats.strRemainingDays }}</span>
        <span class="font-label-md text-label-md text-text-secondary">Hari</span>
      </p>

      <div
        class="h-2 w-full overflow-hidden rounded-full bg-surface-container"
        role="progressbar"
        :aria-valuenow="props.stats.strValidityPercent"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Persentase sisa masa aktif STR"
      >
        <div
          class="h-full rounded-full transition-[width] duration-500"
          :class="strStatusBarClass[props.stats.strStatus]"
          :style="{ width: barWidth }"
        />
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2">
        <span
          class="rounded-md px-2 py-1 font-label-sm text-label-sm"
          :class="strStatusBadgeClass[props.stats.strStatus]"
        >
          {{ strStatusLabel[props.stats.strStatus] }}
        </span>
        <span class="font-caption text-caption text-text-muted">
          {{ props.stats.strValidityPercent }}% dari masa berlaku
        </span>
      </div>
    </template>

    <Skeleton v-else class="h-24 w-full rounded-lg" />
  </section>
</template>
