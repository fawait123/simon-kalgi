<script setup lang="ts">
import type { Component } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<{
  to: string
  label: string
  icon: Component
  badge?: string
  danger?: boolean
}>()

const route = useRoute()
const isExactRoot = computed(() => props.to === '/')
const isActive = computed(() => !isExactRoot.value && route.path === props.to)
</script>

<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-space-sm rounded-lg px-space-md py-2.5 transition-colors"
    :class="cn(
      'font-body-md text-body-md',
      isActive
        ? 'bg-primary font-body-lg text-primary-foreground shadow-sm'
        : danger
          ? 'text-status-danger hover:bg-status-danger-bg'
          : 'text-text-secondary hover:bg-surface-container-low hover:text-text-primary',
    )"
  >
    <span class="flex items-center gap-space-sm min-w-0">
      <component :is="icon" class="size-[18px] shrink-0" aria-hidden="true" />
      <span class="truncate">{{ label }}</span>
    </span>
    <span
      v-if="badge"
      class="ml-auto rounded-full bg-status-danger-bg px-1.5 py-0.5 font-label-sm text-label-sm font-semibold text-status-danger"
    >{{ badge }}</span>
  </NuxtLink>
</template>
