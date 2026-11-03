<script setup lang="ts">
import type { HealthWorkerDto } from '~~/shared/types/health-worker'
import { useDeleteHealthWorkerMutation } from '~/composables/queries/useHealthWorkerQueries'

const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ worker: HealthWorkerDto | null }>()

const deleteMutation = useDeleteHealthWorkerMutation()

function confirmDelete() {
  if (!props.worker)
    return
  deleteMutation.mutate(props.worker.id, {
    onSuccess: () => open.value = false,
  })
}
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent class="max-w-md rounded-xl">
      <AlertDialogHeader>
        <AlertDialogTitle class="font-headline-md text-headline-md">
          Hapus data petugas?
        </AlertDialogTitle>
        <AlertDialogDescription class="font-body-md text-body-md">
          Data <span class="font-body-lg text-text-primary">{{ props.worker?.fullName }}</span>
          (ID Medis {{ props.worker?.medicalId }}) beserta riwayat penugasannya akan dihapus permanen
          dari basis data klinik. Tindakan ini tidak dapat dibatalkan.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel class="rounded-lg font-label-md text-label-md">Batal</AlertDialogCancel>
        <AlertDialogAction
          class="rounded-lg bg-destructive font-label-md text-label-md text-destructive-foreground hover:bg-destructive/90"
          :class="{ 'opacity-70': deleteMutation.isPending.value }"
          :disabled="deleteMutation.isPending.value"
          @click.prevent="confirmDelete"
        >
          {{ deleteMutation.isPending.value ? 'Menghapus...' : 'Ya, Hapus Data' }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
