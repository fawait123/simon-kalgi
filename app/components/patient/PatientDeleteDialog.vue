<script setup lang="ts">
import type { PatientDto } from '~~/shared/types/patient'
import { useDeletePatientMutation } from '~/composables/queries/usePatientQueries'

const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ patient: PatientDto | null }>()

const deleteMutation = useDeletePatientMutation()

function confirmDelete() {
  if (!props.patient)
    return
  deleteMutation.mutate(props.patient.id, {
    onSuccess: () => open.value = false,
  })
}
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent class="max-w-md rounded-xl">
      <AlertDialogHeader>
        <AlertDialogTitle class="font-headline-md text-headline-md">
          Hapus data pasien?
        </AlertDialogTitle>
        <AlertDialogDescription class="font-body-md text-body-md">
          Apakah Anda yakin ingin menghapus data pasien
          <span class="font-body-lg text-text-primary">{{ props.patient?.fullName }}</span>
          ({{ props.patient?.medicalRecordNo }})? Tindakan ini tidak dapat dibatalkan dan seluruh rekam medis
          terkait akan terhapus.
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
