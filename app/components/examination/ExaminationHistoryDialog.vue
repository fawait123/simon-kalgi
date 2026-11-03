<script setup lang="ts">
import type { ExaminationDetailDto } from '~~/shared/types/examination'
import { Loader2, SearchX, Smile } from 'lucide-vue-next'
import {
  examinationStatusBadgeClass,
  examinationStatusLabel,
  formatScore,
} from '~~/shared/types/examination'
import { ohisBadgeClass, ohisCategoryLabel } from '~~/shared/types/patient'
import { useExaminationsQuery, useExaminationLoader } from '~/composables/queries/useExaminationQueries'
import { formatDateId } from '~/lib/format'

const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ select: [exam: ExaminationDetailDto] }>()
const draft = useExaminationForm()
const loadingId = ref<string | null>(null)

const historyQuery = useExaminationsQuery(
  () => ({
    page: 1,
    pageSize: 10,
    patientId: draft.patient.value?.id,
    status: 'all' as const,
  }),
  () => open.value && Boolean(draft.patient.value),
)

const rows = computed(() => historyQuery.data.value?.data ?? [])
const { fetchExaminationDetail } = useExaminationLoader()

async function choose(examinationId: string) {
  loadingId.value = examinationId
  try {
    const response = await fetchExaminationDetail(examinationId)
    emit('select', response.data)
  }
  finally {
    loadingId.value = null
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-[70vw] min-w-[35vw] gap-0 overflow-hidden rounded-xl p-0">
      <div
        class="flex items-center gap-space-md border-b border-border-subtle bg-primary-surface/50 px-space-xl py-space-lg">
        <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-surface text-primary">
          <Smile class="size-5" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <DialogTitle class="font-headline-md text-headline-md text-text-primary">
            Riwayat Pemeriksaan
          </DialogTitle>
          <DialogDescription class="font-caption text-caption text-text-secondary">
            <template v-if="draft.patient.value">
              {{ draft.patient.value.fullName }} · {{ draft.patient.value.medicalRecordNo }}
            </template>
            <template v-else>
              Pilih pasien terlebih dahulu.
            </template>
          </DialogDescription>
        </div>
      </div>

      <div class="flex max-h-[60vh] flex-col gap-space-md overflow-y-auto px-space-xl py-space-lg">
        <template v-if="historyQuery.isPending.value">
          <div v-for="index in 3" :key="index"
            class="flex flex-col gap-2 rounded-xl border border-border-subtle p-space-md">
            <Skeleton class="h-4 w-1/3" />
            <Skeleton class="h-3 w-2/3" />
            <Skeleton class="h-3 w-1/2" />
          </div>
        </template>

        <template v-else-if="historyQuery.isError.value">
          <div class="flex flex-col items-center gap-space-sm rounded-xl bg-status-danger-bg p-space-lg text-center">
            <p class="font-body-md text-body-md text-status-danger">
              Riwayat pemeriksaan gagal dimuat. Periksa koneksi basis data klinik.
            </p>
            <Button type="button" variant="outline" size="sm" @click="() => historyQuery.refetch()">
              Coba muat ulang
            </Button>
          </div>
        </template>

        <template v-else-if="rows.length === 0">
          <div class="flex flex-col items-center gap-space-sm rounded-xl bg-bg-canvas p-space-lg text-center">
            <SearchX class="size-7 text-text-muted" aria-hidden="true" />
            <p class="font-body-md text-body-md text-text-secondary">
              Belum ada pemeriksaan tersimpan untuk pasien ini. Formulir akan dimulai dari data awal.
            </p>
          </div>
        </template>

        <template v-else>
          <article v-for="exam in rows" :key="exam.id"
            class="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-card p-space-md transition-colors hover:border-primary-highlight">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="font-label-md text-label-md font-semibold text-text-primary">
                {{ formatDateId(exam.examDate) }}
              </p>
              <span class="rounded-full px-2 py-0.5 font-label-sm text-label-sm font-semibold"
                :class="examinationStatusBadgeClass[exam.status]">
                {{ examinationStatusLabel[exam.status] }}
              </span>
            </div>

            <p class="font-body-sm text-body-sm text-text-secondary">
              {{ exam.chiefComplaint }}
            </p>

            <dl class="flex flex-wrap items-center gap-x-space-md gap-y-1 font-caption text-caption text-text-muted">
              <div class="flex items-center gap-1.5">
                <dt>Dokter</dt>
                <dd class="font-medium text-text-primary">{{ exam.examinerName }}</dd>
              </div>
              <div class="flex items-center gap-1.5">
                <dt>OHI-S</dt>
                <dd class="rounded px-1.5 py-0.5 font-semibold" :class="ohisBadgeClass[exam.ohisCategory]">
                  {{ formatScore(exam.ohisScore) }} · {{ ohisCategoryLabel[exam.ohisCategory] }}
                </dd>
              </div>
              <div class="flex items-center gap-1.5">
                <dt>Gigi Sehat</dt>
                <dd class="font-medium text-text-primary">{{ exam.healthyTeeth }} / 32</dd>
              </div>
            </dl>

            <Button type="button" variant="outline" size="sm"
              class="self-start gap-1.5 rounded-lg font-label-md text-label-md" :disabled="loadingId === exam.id"
              @click="choose(exam.id)">
              <Loader2 v-if="loadingId === exam.id" class="size-4 animate-spin" aria-hidden="true" />
              Muat ke Formulir
            </Button>
          </article>
        </template>
      </div>

      <div class="flex items-center justify-end gap-space-sm border-t border-border-subtle px-space-xl py-space-md">
        <Button type="button" variant="outline" class="rounded-lg font-label-md text-label-md" @click="open = false">
          Tutup
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
