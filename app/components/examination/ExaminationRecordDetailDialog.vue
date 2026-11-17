<script setup lang="ts">
import type { ExaminationDetailDto, ExaminationListItem } from '~~/shared/types/examination'
import { Loader2, Printer, Smile, X } from 'lucide-vue-next'
import {
  formatScore,
  ohisBands,
  scalingTypeLabel,
  surfaceLabel,
} from '~~/shared/types/examination'
import { ohisBadgeClass, ohisCategoryLabel } from '~~/shared/types/patient'
import { useExaminationLoader } from '~/composables/queries/useExaminationQueries'
import { calcAge, formatDateId } from '~/lib/format'

const props = defineProps<{
  row: ExaminationListItem | null
}>()

const emits = defineEmits<{
  print: [detail: ExaminationDetailDto]
}>()

const open = defineModel<boolean>('open', { required: true })

const loading = ref(false)
const loadError = ref<string | null>(null)
const detail = ref<ExaminationDetailDto | null>(null)

const { fetchExaminationDetail } = useExaminationLoader()

watch(
  () => props.row?.id,
  async (id) => {
    detail.value = null
    loadError.value = null
    if (!id)
      return
    loading.value = true
    try {
      const response = await fetchExaminationDetail(id)
      detail.value = response.data
    }
    catch {
      loadError.value = 'Rekam medis gagal dimuat dari basis data klinik.'
    }
    finally {
      loading.value = false
    }
  },
  { immediate: true },
)

const bandOf = computed(() =>
  ohisBands.find(band => band.category === detail.value?.ohisCategory),
)
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
:show-close-button="false"
      class="flex max-h-[90dvh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-xl p-0 sm:max-w-4xl">
      <!-- Header -->
      <div
        class="flex shrink-0 items-start justify-between gap-space-md border-b border-border-subtle bg-primary-surface/50 px-space-xl py-space-lg">
        <div class="flex min-w-0 items-center gap-space-md">
          <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-surface text-primary">
            <Smile class="size-5" aria-hidden="true" />
          </span>
          <div class="min-w-0">
            <DialogTitle class="font-headline-md text-headline-md text-text-primary">
              Detail Rekam Medis
            </DialogTitle>
            <DialogDescription
              class="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-caption text-caption text-text-secondary">
              <template v-if="row">
                <span class="font-semibold text-text-primary">{{ row.patient.fullName }}</span>
                <span>({{ row.patient.medicalRecordNo }})</span>
                <span aria-hidden="true">·</span>
                <span>{{ calcAge(row.patient.birthDate) ?? '-' }} Thn</span>
                <span aria-hidden="true">·</span>
                <span>{{ formatDateId(row.examDate) }}</span>
                <span aria-hidden="true">·</span>
                <span>drg. {{ row.examinerName }}</span>
              </template>
              <template v-else>
                Pilih rekam medis dari tabel arsip.
              </template>
            </DialogDescription>
          </div>
        </div>
        <Button
type="button" variant="ghost" size="icon" class="shrink-0 rounded-lg" aria-label="Tutup dialog"
          @click="open = false">
          <X class="size-5" aria-hidden="true" />
        </Button>
      </div>

      <!-- Body -->
      <div class="min-h-64 flex-1 overflow-y-auto px-space-xl py-space-lg">
        <div v-if="loading" class="flex min-h-56 flex-col items-center justify-center gap-space-sm text-center">
          <Loader2 class="size-7 animate-spin text-primary" aria-hidden="true" />
          <p class="font-body-md text-body-md text-text-secondary">Memuat rekam medis...</p>
        </div>

        <div
v-else-if="loadError"
          class="flex min-h-56 flex-col items-center justify-center gap-space-sm rounded-xl bg-status-danger-bg p-space-lg text-center">
          <p class="font-body-md text-body-md text-status-danger">{{ loadError }}</p>
        </div>

        <div v-else-if="!detail" class="flex min-h-56 flex-col items-center justify-center gap-2 text-center">
          <Smile class="size-7 text-text-muted" aria-hidden="true" />
          <p class="font-body-md text-body-md text-text-secondary">Tidak ada rekam medis yang dipilih.</p>
        </div>

        <template v-else>
          <div class="flex flex-col gap-space-md">
            <div class="grid grid-cols-1 gap-space-sm sm:grid-cols-3">
              <div class="flex flex-col gap-1 rounded-lg bg-bg-canvas p-space-md">
                <span class="font-caption text-caption uppercase tracking-wider text-text-muted">Debris Index
                  (DI-S)</span>
                <span class="font-metric-display text-metric-display font-bold text-text-primary">{{
                  formatScore(detail.debrisIndex) }}</span>
              </div>
              <div class="flex flex-col gap-1 rounded-lg bg-bg-canvas p-space-md">
                <span class="font-caption text-caption uppercase tracking-wider text-text-muted">Calculus Index
                  (CI-S)</span>
                <span class="font-metric-display text-metric-display font-bold text-text-primary">{{
                  formatScore(detail.calculusIndex) }}</span>
              </div>
              <div class="flex flex-col gap-1 rounded-lg border border-primary/20 bg-primary-surface/60 p-space-md">
                <span class="font-caption text-caption uppercase tracking-wider text-text-muted">Skor OHI-S (DI-S +
                  CI-S)</span>
                <span class="font-metric-display text-metric-display font-bold" :class="bandOf?.textClass">{{
                  formatScore(detail.ohisScore) }}</span>
                <span
class="w-fit rounded border px-2 py-0.5 font-label-sm text-label-sm font-semibold"
                  :class="ohisBadgeClass[detail.ohisCategory]">
                  {{ ohisCategoryLabel[detail.ohisCategory] }}
                </span>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <h3 class="font-label-md text-label-md font-semibold text-text-primary">Hasil per gigi indeks</h3>
              <div class="overflow-hidden rounded-lg border border-border-subtle">
                <Table class="font-body-sm text-body-sm">
                  <TableHeader class="bg-bg-canvas">
                    <TableRow class="border-border-subtle hover:bg-transparent">
                      <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">
                        FDI</TableHead>
                      <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">
                        Permukaan</TableHead>
                      <TableHead
                        class="text-center font-table-header text-table-header uppercase tracking-wider text-text-muted">
                        Debris</TableHead>
                      <TableHead
                        class="text-center font-table-header text-table-header uppercase tracking-wider text-text-muted">
                        Kalkulus</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="score in detail.indexScores" :key="score.id" class="border-border-subtle">
                      <TableCell class="font-semibold text-text-primary">{{ score.fdiNumber }}</TableCell>
                      <TableCell class="text-text-secondary">{{ surfaceLabel[score.surface] }}</TableCell>
                      <TableCell class="text-center font-mono text-text-primary">{{ score.debrisValue }}</TableCell>
                      <TableCell class="text-center font-mono text-text-primary">{{ score.calculusValue }}</TableCell>
                    </TableRow>
                    <TableRow v-if="detail.indexScores.length === 0" class="border-border-subtle">
                      <TableCell colspan="4" class="py-space-lg text-center font-body-sm text-text-secondary">
                        Tidak ada skor indeks tersimpan pada rekaman ini.
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <p class="font-caption text-caption text-text-muted">
                Skala 0 bersih hingga 3 deposit berat, dinilai pada 6 gigi indeks satu permukaan tiap gigi.
              </p>
            </div>

            <dl class="grid grid-cols-1 gap-space-md rounded-lg border border-border-subtle p-space-md md:grid-cols-2">
              <div class="flex flex-col gap-0.5">
                <dt class="font-caption text-caption uppercase tracking-wider text-text-muted">Kondisi Gingiva</dt>
                <dd class="font-body-sm text-body-sm text-text-primary">{{ detail.gingivaCondition }}</dd>
              </div>
              <div class="flex flex-col gap-0.5">
                <dt class="font-caption text-caption uppercase tracking-wider text-text-muted">Mobilitas / Mukosa</dt>
                <dd class="font-body-sm text-body-sm text-text-primary">Derajat {{ detail.mobilityDegree }} · {{
                  detail.mucosaCondition }}</dd>
              </div>
              <div class="flex flex-col gap-0.5 md:col-span-2">
                <dt class="font-caption text-caption uppercase tracking-wider text-text-muted">Diagnosis Kebersihan
                  Mulut</dt>
                <dd class="font-body-sm text-body-sm text-text-primary">{{ detail.hygieneDiagnosis ??
                  detail.chiefComplaint }}</dd>
              </div>
              <div class="flex flex-col gap-0.5 md:col-span-2">
                <dt class="font-caption text-caption uppercase tracking-wider text-text-muted">Rencana Tindakan</dt>
                <dd class="font-body-sm text-body-sm text-text-primary">
                  <ul v-if="detail.planOfAction.length" class="list-disc space-y-0.5 pl-5 marker:text-text-muted">
                    <li v-for="(plan, index) in detail.planOfAction" :key="index">{{ plan }}</li>
                  </ul>
                  <span v-else>{{ detail.prescriptionNote ?? 'Tidak ada rencana tindakan tercatat.' }}</span>
                </dd>
              </div>
              <div v-if="detail.scalingRecord" class="flex flex-col gap-0.5 md:col-span-2">
                <dt class="font-caption text-caption uppercase tracking-wider text-text-muted">Tindakan Scaling</dt>
                <dd class="flex flex-col gap-1 font-body-sm text-body-sm text-text-primary">
                  <span class="w-fit rounded-full border border-status-success/30 bg-status-success-bg px-2 py-0.5 font-label-sm text-label-sm font-semibold text-status-success">
                    {{ scalingTypeLabel[detail.scalingRecord.scalingType] }} · {{ detail.scalingRecord.quadrants }}
                  </span>
                  <span class="font-caption text-caption text-text-muted">
                    Operator {{ detail.scalingRecord.operatorName }} ·
                    {{ formatDateId(detail.scalingRecord.performedAt) }}
                  </span>
                  <span v-if="detail.scalingRecord.note" class="text-text-secondary">
                    {{ detail.scalingRecord.note }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </template>
      </div>

      <!-- Footer -->
      <div
v-if="detail && !loading && !loadError"
        class="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border-subtle bg-surface-container-low px-space-xl py-space-md">
        <span class="font-body-sm text-body-sm text-text-secondary">
          Kontrol berikutnya:
          <span class="font-semibold text-text-primary">
            {{ detail.nextVisitAt ? formatDateId(detail.nextVisitAt) : 'Belum dijadwalkan' }}
          </span>
        </span>
        <Button
type="button" variant="outline" size="sm" class="gap-1.5 rounded-lg font-label-md text-label-md"
          @click="emits('print', detail)">
          <Printer class="size-4" aria-hidden="true" />
          Cetak Rekam Medis
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
