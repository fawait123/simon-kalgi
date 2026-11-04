<script setup lang="ts">
import type { Component } from 'vue'
import { Flame, TrendingDown, TrendingUp } from 'lucide-vue-next'

interface CareMetricTrend {
  text: string
  direction: 'up' | 'down'
}

const props = defineProps<{
  label: string
  value: string
  icon: Component
  progressPercent: number
  caption?: string
  trend?: CareMetricTrend
  chip?: string
  progressClass?: string
  footerLeft?: string
  footerRight?: string
}>()

const barClass = computed(() => props.progressClass ?? 'bg-primary-container')

const trendClass = computed(() =>
  props.trend?.direction === 'up'
    ? 'bg-status-success-bg text-status-success'
    : 'bg-status-warning-bg text-status-warning')
</script>

<template>
  <div class="flex flex-col gap-space-md rounded-xl border border-border-subtle bg-surface-card p-space-md shadow-sm">
    <div class="flex items-start justify-between gap-2">
      <span class="text-table-header font-semibold uppercase tracking-wider text-text-muted">
        {{ label }}
      </span>
      <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-primary">
        <component :is="icon" class="size-5" aria-hidden="true" />
      </span>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <span class="font-metric-display text-metric-display text-text-primary">{{ value }}</span>
      <span v-if="caption" class="font-body-sm text-body-sm text-text-secondary">{{ caption }}</span>
      <span
        v-if="trend"
        class="flex items-center gap-1 rounded-full px-2 py-0.5 font-label-sm text-label-sm"
        :class="trendClass"
      >
        <TrendingUp v-if="trend.direction === 'up'" class="size-3.5" aria-hidden="true" />
        <TrendingDown v-else class="size-3.5" aria-hidden="true" />
        {{ trend.text }}
      </span>
    </div>

    <span
      v-if="chip"
      class="flex w-fit items-center gap-1.5 rounded-full bg-status-warning-bg px-2.5 py-1 font-label-sm text-label-sm text-tertiary"
    >
      <Flame class="size-3.5 text-status-warning" aria-hidden="true" />
      {{ chip }}
    </span>

    <div
      class="h-1.5 w-full overflow-hidden rounded-full bg-border-subtle"
      role="progressbar"
      :aria-valuenow="Math.round(progressPercent)"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`${label}: ${Math.round(progressPercent)} persen`"
    >
      <div class="h-full rounded-full transition-[width]" :class="barClass" :style="{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }" />
    </div>

    <div
      v-if="footerLeft || footerRight"
      class="flex items-center justify-between gap-2 rounded-lg bg-bg-canvas px-2 py-1.5 font-caption text-caption text-text-muted"
    >
      <span>{{ footerLeft }}</span>
      <span v-if="footerRight" class="font-label-sm text-label-sm text-text-secondary">{{ footerRight }}</span>
    </div>
  </div>
</template>
