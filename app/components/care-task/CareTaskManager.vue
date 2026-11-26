<script setup lang="ts">
import type { CareTaskStaffDto } from '~~/shared/types/care-task'
import { ListChecks, Lock, Pencil, Plus, RotateCcw, SearchX, Trash2 } from 'lucide-vue-next'
import { careSessionLabel } from '~~/shared/types/care'
import { useCareTasksQuery } from '~/composables/queries/useCareTaskQueries'

const props = defineProps<{
  patientId: string
  patientName: string
  medicalRecordNo: string
}>()

const formOpen = ref(false)
const deleteOpen = ref(false)
const activeTask = ref<CareTaskStaffDto | null>(null)

const listQuery = useCareTasksQuery(() => props.patientId)
const tasks = computed(() => listQuery.data.value?.data ?? [])

const errorText = computed(() =>
  listQuery.error.value
    ? (listQuery.error.value as { statusMessage?: string }).statusMessage
      ?? 'Basis data tugas perawatan tidak dapat dijangkau.'
    : undefined)

const sessionBadgeClass: Record<CareTaskStaffDto['session'], string> = {
  pagi: 'bg-status-warning-bg text-status-warning',
  siang: 'bg-status-info-bg text-status-info',
  malam: 'bg-primary-surface text-primary',
}

function openCreate() {
  activeTask.value = null
  formOpen.value = true
}

function openEdit(task: CareTaskStaffDto) {
  activeTask.value = task
  formOpen.value = true
}

function openDelete(task: CareTaskStaffDto) {
  activeTask.value = task
  deleteOpen.value = true
}
</script>

<template>
  <section class="flex flex-col gap-space-md rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-sm">
    <div class="flex flex-wrap items-start justify-between gap-space-md">
      <div class="flex min-w-0 items-start gap-space-md">
        <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-surface text-primary">
          <ListChecks class="size-5" aria-hidden="true" />
        </span>
        <div class="flex min-w-0 flex-col gap-1">
          <h2 class="font-headline-md text-headline-md font-bold text-text-primary">Tugas Perawatan Mandiri</h2>
          <p class="max-w-3xl font-body-sm text-body-sm text-text-secondary">
            Instruksi harian untuk
            <span class="font-semibold text-text-primary">{{ patientName }}</span>
            ({{ medicalRecordNo }}) yang muncul pada checklist pasien. Tiga sesi harian (pagi, siang, malam) sudah
            aktif otomatis sebagai tugas bawaan; tugas berulang hanya dapat dicentang pada tanggal berjalan.
          </p>
        </div>
      </div>

      <Button
        type="button"
        class="flex shrink-0 items-center gap-2 rounded-lg font-label-md text-label-md shadow-sm"
        @click="openCreate"
      >
        <Plus class="size-4" aria-hidden="true" />
        Tambah Tugas
      </Button>
    </div>

    <Separator class="bg-border-subtle" />

    <div v-if="listQuery.isError.value" class="flex flex-col items-center gap-space-md py-space-xl text-center">
      <span class="flex size-12 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger">
        <SearchX class="size-6" aria-hidden="true" />
      </span>
      <div class="flex flex-col gap-1">
        <span class="font-headline-sm text-headline-sm text-text-primary">Tugas perawatan gagal dimuat</span>
        <p class="max-w-md font-body-md text-body-md text-text-secondary">
          {{ errorText }}
        </p>
      </div>
      <Button type="button" variant="outline" class="gap-2 rounded-lg" @click="() => listQuery.refetch()">
        <RotateCcw class="size-4" aria-hidden="true" />
        Muat Ulang
      </Button>
    </div>

    <div v-else class="overflow-x-auto">
      <Table class="font-body-sm text-body-sm">
        <TableHeader>
          <TableRow class="border-border-subtle hover:bg-transparent">
            <TableHead class="w-[110px] font-table-header text-table-header uppercase tracking-wider text-text-muted">Sesi</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Tugas &amp; Instruksi</TableHead>
            <TableHead class="w-[130px] font-table-header text-table-header uppercase tracking-wider text-text-muted">Riwayat</TableHead>
            <TableHead class="w-[96px] text-right font-table-header text-table-header uppercase tracking-wider text-text-muted">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <template v-if="listQuery.isPending.value">
            <TableRow v-for="index in 3" :key="`skeleton-${index}`" class="border-border-subtle">
              <TableCell colspan="4">
                <Skeleton class="h-12 w-full" />
              </TableCell>
            </TableRow>
          </template>

          <template v-if="!listQuery.isPending.value">
            <TableRow
              v-for="task in tasks"
              :key="task.id"
              class="border-border-subtle align-top hover:bg-surface-container-low"
            >
              <TableCell class="align-top">
                <span
                  class="inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-label-sm text-label-sm font-semibold"
                  :class="sessionBadgeClass[task.session]"
                >
                  {{ careSessionLabel[task.session] }}
                </span>
                <p v-if="task.isBuiltin" class="mt-1 inline-flex items-center gap-1 font-caption text-caption text-text-muted">
                  <Lock class="size-3" aria-hidden="true" />
                  Bawaan sistem
                </p>
              </TableCell>

              <TableCell class="align-top">
                <div class="flex min-w-0 max-w-xl flex-col gap-0.5">
                  <span class="font-body-lg text-body-lg font-medium text-text-primary">{{ task.title }}</span>
                  <span class="line-clamp-2 font-caption text-caption text-text-secondary">{{ task.instruction }}</span>
                  <span class="font-caption text-caption text-text-muted">{{ task.timeStart }} – {{ task.timeEnd }}</span>
                </div>
              </TableCell>

              <TableCell class="align-top">
                <span
                  class="inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-label-sm text-label-sm"
                  :class="task.completionCount > 0
                    ? 'bg-status-success-bg text-status-success'
                    : 'bg-surface-container-low text-text-muted'"
                >
                  <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
                  {{ task.completionCount > 0 ? `${task.completionCount} riwayat` : 'Belum ada riwayat' }}
                </span>
              </TableCell>

              <TableCell class="align-top">
                <div class="flex items-center justify-end gap-1">
                  <Tooltip v-if="task.isBuiltin">
                    <TooltipTrigger as-child>
                      <span tabindex="0" class="inline-flex">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          class="size-8 rounded-lg text-text-muted opacity-60"
                          aria-label="Tugas bawaan sistem terkunci"
                          disabled
                        >
                          <Lock class="size-[18px]" aria-hidden="true" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="left" class="max-w-64">
                      Tugas bawaan sistem tidak dapat diubah atau dihapus.
                    </TooltipContent>
                  </Tooltip>

                  <template v-else>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="size-8 rounded-lg text-text-secondary hover:bg-primary-surface hover:text-primary"
                      aria-label="Edit tugas perawatan"
                      @click="openEdit(task)"
                    >
                      <Pencil class="size-[18px]" aria-hidden="true" />
                    </Button>

                    <Tooltip v-if="task.completionCount > 0">
                      <TooltipTrigger as-child>
                        <span tabindex="0" class="inline-flex">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            class="size-8 rounded-lg text-text-muted opacity-60"
                            aria-label="Hapus tugas diblokir karena sudah ada riwayat centang"
                            disabled
                          >
                            <Trash2 class="size-[18px]" aria-hidden="true" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="left" class="max-w-64">
                        Sudah memiliki {{ task.completionCount }} riwayat centang; hapus diblokir. Edit isi tugas bila
                        perlu mengubah instruksi.
                      </TooltipContent>
                    </Tooltip>

                    <Button
                      v-else
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="size-8 rounded-lg text-text-secondary hover:bg-status-danger-bg hover:text-status-danger"
                      aria-label="Hapus tugas perawatan"
                      @click="openDelete(task)"
                    >
                      <Trash2 class="size-[18px]" aria-hidden="true" />
                    </Button>
                  </template>
                </div>
              </TableCell>
            </TableRow>
          </template>

          <TableRow v-if="!listQuery.isPending.value && tasks.length === 0" class="border-border-subtle">
            <TableCell colspan="4" class="px-3 py-space-2xl">
              <div class="flex flex-col items-center gap-space-sm text-center">
                <span class="flex size-12 items-center justify-center rounded-xl bg-surface-container-low text-text-muted">
                  <ListChecks class="size-6" aria-hidden="true" />
                </span>
                <span class="font-headline-sm text-headline-sm text-text-primary">Belum ada tugas tambahan</span>
                <p class="max-w-md font-body-md text-body-md text-text-secondary">
                  Checklist pasien sudah memuat tiga sesi harian bawaan (pagi, siang, malam) yang tampil otomatis saat
                  pasien pertama kali membuka checklist. Tambahkan tugas khusus di luar itu bila perlu.
                </p>
                <Button type="button" variant="outline" class="gap-2 rounded-lg" @click="openCreate">
                  <Plus class="size-4" aria-hidden="true" />
                  Tambah Tugas Tambahan
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <CareTaskFormDialog v-model:open="formOpen" :patient-id="patientId" :initial="activeTask" />
    <CareTaskDeleteDialog v-model:open="deleteOpen" :task="activeTask" />
  </section>
</template>
