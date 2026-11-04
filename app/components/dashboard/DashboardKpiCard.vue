<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(defineProps<{
  label: string
  value: string | number
  icon: Component
  valueClass?: string
}>(), {
  valueClass: 'text-text-primary',
})
</script>

<template>
  <div class="flex flex-col gap-space-md rounded-xl bg-surface-card p-space-md shadow-sm">
    <div class="flex items-start justify-between gap-2">
      <span class="text-table-header font-semibold uppercase tracking-wider text-text-muted">
        {{ label }}
      </span>
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-primary">
        <component :is="icon" class="size-5" aria-hidden="true" />
      </span>
    </div>

    <span class="text-metric-display" :class="valueClass">{{ value }}</span>

    <div class="mt-auto rounded-lg bg-bg-canvas p-2">
      <slot name="footer" />
    </div>
  </div>
</template>
