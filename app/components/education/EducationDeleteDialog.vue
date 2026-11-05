<script setup lang="ts">
import type { EducationArticleDto } from '~~/shared/types/education'
import { useDeleteEducationMutation } from '~/composables/queries/useEducationQueries'

const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ article: EducationArticleDto | null }>()

const deleteMutation = useDeleteEducationMutation()

function confirmDelete() {
  if (!props.article)
    return
  deleteMutation.mutate(props.article.id, {
    onSuccess: () => open.value = false,
  })
}
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent class="max-w-md rounded-xl">
      <AlertDialogHeader>
        <AlertDialogTitle class="font-headline-md text-headline-md">
          Hapus materi edukasi?
        </AlertDialogTitle>
        <AlertDialogDescription class="font-body-md text-body-md">
          Materi <span class="font-body-lg text-text-primary">{{ props.article?.title }}</span> akan dihapus
          permanen dari basis data klinik dan tidak lagi tampil di portal pasien. Tindakan ini tidak dapat
          dibatalkan.
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
          {{ deleteMutation.isPending.value ? 'Menghapus...' : 'Ya, Hapus Materi' }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
