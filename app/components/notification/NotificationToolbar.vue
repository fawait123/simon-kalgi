<script setup lang="ts">
import type { NotificationReadFilter } from '~~/shared/schemas/notification.schema'
import { CheckCheck, Inbox } from 'lucide-vue-next'

const props = defineProps<{
  filter: NotificationReadFilter
  unread: number
  total: number
  isMarkingAll?: boolean
}>()

const emits = defineEmits<{
  'update:filter': [filter: NotificationReadFilter]
  'mark-all': []
}>()

const tabs: { key: NotificationReadFilter, label: string, count: () => number }[] = [
  { key: 'all', label: 'Semua', count: () => props.total },
  { key: 'unread', label: 'Belum Dibaca', count: () => props.unread },
  { key: 'read', label: 'Sudah Dibaca', count: () => Math.max(0, props.total - props.unread) },
]
</script>

<template>
  <div class="flex flex-col gap-space-md p-space-md lg:flex-row lg:items-center lg:justify-between">
    <div
      class="flex w-full items-center gap-1 overflow-x-auto rounded-lg bg-bg-canvas p-1 lg:w-auto"
      role="tablist"
      aria-label="Filter status baca notifikasi"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        role="tab"
        :aria-selected="filter === tab.key"
        class="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 font-label-md text-label-md transition-colors"
        :class="filter === tab.key
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-text-secondary hover:bg-surface-container-low'"
        @click="emits('update:filter', tab.key)"
      >
        <Inbox v-if="tab.key === 'all'" class="size-4" aria-hidden="true" />
        {{ tab.label }}
        <span
          class="rounded px-1.5 py-0.5 font-caption text-caption font-semibold"
          :class="filter === tab.key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-surface-card text-text-muted'"
        >
          {{ tab.count() }}
        </span>
      </button>
    </div>

    <Button
      type="button"
      variant="outline"
      size="sm"
      class="flex shrink-0 items-center gap-2 self-start rounded-lg lg:self-auto"
      :disabled="unread === 0 || isMarkingAll"
      @click="emits('mark-all')"
    >
      <CheckCheck class="size-4" aria-hidden="true" />
      {{ isMarkingAll ? 'Menandai...' : 'Tandai Semua Dibaca' }}
    </Button>
  </div>
</template>
