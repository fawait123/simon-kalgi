<script setup lang="ts">
import type { CareTaskDto } from '~~/shared/types/care'
import { careTaskStatusBadgeClass, careTaskStatusLabel } from '~~/shared/types/care'
import { formatUtcTime } from '~/lib/format'
import { CalendarDays, Clock, TriangleAlert } from 'lucide-vue-next'

const props = defineProps<{
  task: CareTaskDto
  isPending?: boolean
}>()

const emit = defineEmits<{ toggle: [done: boolean] }>()

const hint = computed(() => {
  if (props.task.status === 'belum')
    return 'Lewati jam anjuran tidak disarankan — plak mulai mengeras setelah 24 jam.'
  if (props.task.status === 'terlewat')
    return 'Tugas pada hari ini tercatat terlewat. Centang tidak dapat lagi diberikan pada hari lampau.'
  return null
})

const hintClass = computed(() =>
  props.task.status === 'terlewat' ? 'text-status-danger' : 'text-status-warning')
</script>

<template>
  <!-- Checkbox shadcn dibungkus reka-ui CheckboxRoot yang merender <button>, jadi <label for> tidak
       akan pernah menunjuk elemen yang bisa di-label. Cukup aria-label + aria-describedby. -->
  <article
    class="flex flex-col gap-space-md rounded-xl border border-border-subtle bg-surface-card p-space-md shadow-sm"
    :class="task.done ? 'border-l-4 border-l-status-success' : 'border-l-4 border-l-primary-container'"
  >
    <div class="flex items-start gap-space-md">
      <Checkbox
        :model-value="task.done"
        :disabled="!task.isToggleable || isPending"
        :aria-label="task.done ? `Batalkan centang: ${task.title}` : `Tandai selesai: ${task.title}`"
        :aria-describedby="hint ? `task-hint-${task.taskId}` : undefined"
        class="mt-0.5"
        @update:model-value="emit('toggle', Boolean($event))"
      />

      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="font-headline-sm text-headline-sm text-text-primary">
            {{ task.title }}
          </h3>
          <span
            class="rounded-full px-2 py-0.5 font-label-sm text-label-sm"
            :class="careTaskStatusBadgeClass[task.status]"
          >
            {{ careTaskStatusLabel[task.status] }}
          </span>
        </div>
        <p class="font-body-md text-body-md text-text-secondary">
          {{ task.instruction }}
        </p>
      </div>
    </div>

    <div class="flex flex-col gap-1 font-caption text-caption text-text-muted">
      <p v-if="task.done && task.completedAt" class="flex items-center gap-1.5 text-status-success">
        <Clock class="size-3.5" aria-hidden="true" />
        Selesai pada {{ formatUtcTime(task.completedAt) }} WIB
      </p>
      <p v-else class="flex items-center gap-1.5">
        <CalendarDays class="size-3.5" aria-hidden="true" />
        Waktu anjuran: {{ task.timeStart }} – {{ task.timeEnd }} WIB
      </p>
      <p v-if="task.dpjpName" class="flex items-center gap-1.5">
        Instruksi DPJP: <span class="font-label-md text-label-md text-text-secondary">{{ task.dpjpName }}</span>
      </p>
      <p v-if="hint" :id="`task-hint-${task.taskId}`" class="mt-1 flex items-center gap-1.5" :class="hintClass">
        <TriangleAlert class="size-3.5" aria-hidden="true" />
        {{ hint }}
      </p>
    </div>

    <div class="mt-auto">
      <Button
        v-if="task.isToggleable"
        :variant="task.done ? 'outline' : 'default'"
        size="sm"
        :disabled="isPending"
        @click="emit('toggle', !task.done)"
      >
        {{ isPending ? 'Menyimpan...' : task.done ? 'Batalkan' : 'Tandai Selesai' }}
      </Button>
      <p v-else class="font-caption text-caption text-text-muted">
        {{ task.status === 'terjadwal'
          ? 'Tugas baru dapat dibuka pada tanggalnya.'
          : 'Hari lampau hanya-baca; progres terkunci sebagai riwayat klinis.' }}
      </p>
    </div>
  </article>
</template>
