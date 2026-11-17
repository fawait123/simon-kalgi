<script setup lang="ts">
import type { ExaminationListItem } from '~~/shared/types/examination'
import { useDeleteExaminationMutation } from '~/composables/queries/useExaminationQueries'
import { formatDateId } from '~/lib/format'

const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ row: ExaminationListItem | null }>()

const deleteMutation = useDeleteExaminationMutation()

function confirmDelete() {
  if (!props.row)
    return
  deleteMutation.mutate(
    { id: props.row.id, patientId: props.row.patientId },
    { onSuccess: () => open.value = false },
  )
}
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent class="max-w-md rounded-xl">
      <AlertDialogHeader>
        <AlertDialogTitle class="font-headline-md text-headline-md">
          Hapus rekam medis pemeriksaan?
        </AlertDialogTitle>
        <AlertDialogDescription class="font-body-md text-body-md">
          Rekam medis
          <span class="font-body-lg text-text-primary">{{ props.row?.patient.fullName }}</span>
          ({{ props.row?.patient.medicalRecordNo }}) tanggal
          {{ props.row ? formatDateId(props.row.examDate) : '-' }} akan dihapus permanen beserta skor
          OHI-S-nya. Ringkasan pada data pasien akan dikembalikan ke pemeriksaan final terbaru yang tersisa.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel class="rounded-lg font-label-md text-label-md">Batal</AlertDialogCancel>
        <AlertDialogAction
          class="rounded-lg bg-status-danger font-label-md text-label-md text-on-primary hover:bg-status-danger/90"
          :class="{ 'opacity-70': deleteMutation.isPending.value }"
          :disabled="deleteMutation.isPending.value"
          @click.prevent="confirmDelete"
        >
          {{ deleteMutation.isPending.value ? 'Menghapus...' : 'Ya, Hapus Rekam Medis' }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
