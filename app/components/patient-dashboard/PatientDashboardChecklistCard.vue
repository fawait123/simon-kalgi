<script setup lang="ts">
import type { CareTaskDto } from '~~/shared/types/care'
import { carePercentOf, careSessionLabel } from '~~/shared/types/care'
import { formatUtcTime } from '~/lib/format'
import { Check, ListChecks } from 'lucide-vue-next'

const props = defineProps<{
  tasks: CareTaskDto[]
  dateLabel: string
  pendingTaskKey: string | null
  isLoading?: boolean
}>()

const emit = defineEmits<{ toggle: [task: CareTaskDto, done: boolean] }>()

const doneCount = computed(() => props.tasks.filter(task => task.done).length)
const percent = computed(() => carePercentOf(doneCount.value, props.tasks.length))

function taskKey(task: CareTaskDto) {
  return `${task.taskId}|${task.date}`
}
</script>

<template>
  <section class="flex flex-col rounded-xl border border-border-subtle bg-surface-card p-space-xl shadow-sm">
    <div class="mb-space-sm flex items-center justify-between gap-2">
      <h2 class="flex items-center gap-2 font-headline-md text-headline-md text-text-primary">
        <ListChecks class="size-5 text-primary" aria-hidden="true" />
        Checklist Hari Ini
      </h2>
      <span class="font-label-sm text-label-sm text-text-muted">{{ dateLabel }}</span>
    </div>

    <div v-if="isLoading" class="flex flex-col gap-space-xs py-space-md">
      <Skeleton v-for="row in 3" :key="row" class="h-14 w-full rounded-lg" />
    </div>

    <template v-else>
      <div class="mb-space-md">
        <div class="mb-1 flex items-center justify-between font-caption text-caption text-text-secondary">
          <span>Kemajuan Harian</span>
          <span class="font-semibold text-primary">
            {{ doneCount }} dari {{ tasks.length }} Selesai ({{ Math.round(percent) }}%)
          </span>
        </div>
        <div
          class="h-2 w-full overflow-hidden rounded-full bg-surface-container-low"
          role="progressbar"
          :aria-valuenow="Math.round(percent)"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Kemajuan checklist harian"
        >
          <div class="h-full rounded-full bg-primary-container transition-[width]" :style="{ width: `${percent}%` }" />
        </div>
      </div>

      <p
        v-if="tasks.length === 0"
        class="mb-space-md rounded-lg bg-bg-canvas p-space-md font-body-md text-body-md text-text-secondary"
      >
        DPJP belum menetapkan tugas mandiri untuk hari ini. Cek kembali setelah instruksi dokter masuk.
      </p>

      <div v-else class="mb-space-md flex flex-col gap-space-xs">
        <div
          v-for="task in tasks"
          :key="taskKey(task)"
          class="flex items-center justify-between gap-2 rounded-lg p-space-sm transition-colors"
          :class="task.done ? 'bg-bg-canvas' : 'bg-surface-container-low'"
        >
          <div class="flex min-w-0 items-center gap-space-sm">
            <span
              v-if="task.done"
              class="flex size-6 shrink-0 items-center justify-center rounded-full bg-status-success-bg text-status-success"
            >
              <Check class="size-4" aria-hidden="true" />
            </span>
            <Checkbox
              v-else
              :model-value="false"
              :disabled="!task.isToggleable || pendingTaskKey !== null"
              :aria-label="`Tandai selesai: ${task.title}`"
              class="size-5 shrink-0"
              @update:model-value="emit('toggle', task, Boolean($event))"
            />
            <div class="flex min-w-0 flex-col">
              <span
                class="truncate font-label-md text-label-md"
                :class="task.done ? 'text-text-muted line-through' : 'text-text-primary'"
              >
                {{ task.title }}
              </span>
              <span
                class="truncate font-caption text-caption"
                :class="task.done ? 'text-text-muted' : 'text-text-secondary'"
              >
                {{ task.done && task.completedAt
                  ? `Tercatat selesai ${formatUtcTime(task.completedAt)} WIB`
                  : task.isToggleable
                    ? `Batas waktu ${task.timeEnd} WIB`
                    : 'Menunggu waktu sesi tugas ini' }}
              </span>
            </div>
          </div>
          <span class="shrink-0 rounded bg-surface-card px-2 py-0.5 font-label-sm text-label-sm text-text-secondary">
            {{ careSessionLabel[task.session] }}
          </span>
        </div>
      </div>

      <Button as-child variant="secondary" class="w-full justify-center rounded-lg font-semibold">
        <NuxtLink to="/pasien/kepatuhan">Buka Lembar Monitoring Lengkap</NuxtLink>
      </Button>
    </template>
  </section>
</template>
