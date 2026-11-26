<script setup lang="ts">
import type { CareTaskStaffDto } from '~~/shared/types/care-task'
import { useDeleteCareTaskMutation } from '~/composables/queries/useCareTaskQueries'

const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ task: CareTaskStaffDto | null }>()

const deleteMutation = useDeleteCareTaskMutation()

const errorText = computed(() => {
  const error = deleteMutation.error.value as
    | { data?: { message?: string }, statusMessage?: string }
    | null
  if (!error)
    return null
  return error.data?.message ?? error.statusMessage ?? 'Gagal menghapus tugas perawatan.'
})

watch(open, (isOpen) => {
  if (isOpen)
    deleteMutation.reset()
})

function confirmDelete() {
  if (!props.task)
    return
  deleteMutation.mutate(props.task.id, {
    onSuccess: () => open.value = false,
  })
}
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent class="max-w-md rounded-xl">
      <AlertDialogHeader>
        <AlertDialogTitle class="font-headline-md text-headline-md">
          Hapus tugas perawatan?
        </AlertDialogTitle>
        <AlertDialogDescription class="font-body-md text-body-md">
          Tugas <span class="font-body-lg text-text-primary">{{ props.task?.title }}</span> akan dihapus
          permanen dari portal pasien dan tidak lagi muncul pada checklist harian. Tindakan ini tidak dapat
          dibatalkan.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <p
        v-if="errorText"
        class="rounded-lg bg-status-danger-bg p-space-sm font-caption text-caption text-status-danger"
      >
        {{ errorText }}
      </p>

      <AlertDialogFooter>
        <AlertDialogCancel class="rounded-lg font-label-md text-label-md">Batal</AlertDialogCancel>
        <AlertDialogAction
          class="rounded-lg bg-destructive font-label-md text-label-md text-destructive-foreground hover:bg-destructive/90"
          :class="{ 'opacity-70': deleteMutation.isPending.value }"
          :disabled="deleteMutation.isPending.value"
          @click.prevent="confirmDelete"
        >
          {{ deleteMutation.isPending.value ? 'Menghapus...' : 'Ya, Hapus Tugas' }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
