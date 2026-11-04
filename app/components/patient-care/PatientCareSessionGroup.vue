<script setup lang="ts">
import type { CareSessionGroupDto, CareTaskDto } from '~~/shared/types/care'
import { careSessionLabel } from '~~/shared/types/care'
import { CheckCheck, Moon, Sun, Sunset } from 'lucide-vue-next'

const props = defineProps<{
  group: CareSessionGroupDto
  pendingTaskKey: string | null
}>()

const emit = defineEmits<{ toggle: [task: CareTaskDto, done: boolean] }>()

function taskKey(task: CareTaskDto) {
  return `${task.taskId}|${task.date}`
}

const sessionIcon = computed(() =>
  props.group.session === 'pagi' ? Sun : props.group.session === 'siang' ? Sunset : Moon)

const isComplete = computed(() => props.group.total > 0 && props.group.done === props.group.total)
</script>

<template>
  <section class="flex flex-col gap-space-md rounded-xl border border-border-subtle bg-surface-card p-space-md shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="flex items-center gap-2 font-headline-md text-headline-md text-text-primary">
        <span class="flex size-8 items-center justify-center rounded-lg bg-surface-container-low text-primary">
          <component :is="sessionIcon" class="size-4" aria-hidden="true" />
        </span>
        {{ group.title }}
      </h2>      <span
        class="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label-sm text-label-sm"
        :class="isComplete ? 'bg-status-success-bg text-status-success' : 'bg-surface-container text-text-secondary'"
      >
        <CheckCheck v-if="isComplete" class="size-3.5" aria-hidden="true" />
        {{ isComplete
          ? `${group.total} dari ${group.total} Tuntas`
          : `${group.done} dari ${group.total} selesai · Sesi ${careSessionLabel[group.session]}` }}
      </span>
    </div>

    <ul class="flex flex-col gap-space-md" role="list">
      <li v-for="task in group.tasks" :key="`${task.taskId}-${task.date}`">
        <PatientCareTaskCard
          :task="task"
          :is-pending="pendingTaskKey === taskKey(task)"
          @toggle="emit('toggle', task, $event)"
        />
      </li>
    </ul>
  </section>
</template>
