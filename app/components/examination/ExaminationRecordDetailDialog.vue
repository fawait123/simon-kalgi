<script setup lang="ts">
import type { ExaminationDetailDto, ExaminationListItem, ExaminationRecordTab, ExaminationToothDto } from '~~/shared/types/examination'
import type { ToothCondition } from '@prisma/client'
import { Loader2, Printer, Smile, SquareChartGantt, X } from 'lucide-vue-next'
import {
  formatScore,
  lowerArchTeeth,
  ohisBands,
  surfaceLabel,
  toothConditionClass,
  toothConditionLabel,
  toothConditionOrder,
  toothConditionSwatch,
  toothNameOf,
  totalPermanentTeeth,
  upperArchTeeth,
} from '~~/shared/types/examination'
import { ohisBadgeClass, ohisCategoryLabel } from '~~/shared/types/patient'
import { useExaminationLoader } from '~/composables/queries/useExaminationQueries'
import { calcAge, formatDateId } from '~/lib/format'

const props = defineProps<{
  row: ExaminationListItem | null
  tab: ExaminationRecordTab
}>()

const emits = defineEmits<{
  'update:tab': [tab: ExaminationRecordTab]
  print: [detail: ExaminationDetailDto]
}>()

const open = defineModel<boolean>('open', { required: true })

const loading = ref(false)
const loadError = ref<string | null>(null)
const detail = ref<ExaminationDetailDto | null>(null)

const { fetchExaminationDetail } = useExaminationLoader()

const arches = [
  { jaw: 'Rahang Atas (Maxilla)', teeth: upperArchTeeth },
  { jaw: 'Rahang Bawah (Mandibula)', teeth: lowerArchTeeth },
]

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

const toothMap = computed(() => {
  const map = new Map<number, ExaminationToothDto>()
  for (const tooth of detail.value?.teeth ?? [])
    map.set(tooth.fdiNumber, tooth)
  return map
})

const notedTeeth = computed(() =>
  (detail.value?.teeth ?? []).filter(tooth => tooth.condition !== 'sehat'),
)

function conditionOf(fdiNumber: number): ToothCondition {
  return toothMap.value.get(fdiNumber)?.condition ?? 'sehat'
}

function countOf(condition: ToothCondition) {
  return [...upperArchTeeth, ...lowerArchTeeth].filter(fdiNumber => conditionOf(fdiNumber) === condition).length
}

const bandOf = computed(() =>
  ohisBands.find(band => band.category === detail.value?.ohisCategory),
)

const tabs: { value: ExaminationRecordTab, label: string, icon: typeof Smile }[] = [
  { value: 'odontogram', label: 'Odontogram 32 Gigi', icon: Smile },
  { value: 'ohis', label: 'Hasil OHI-S & Kalkulus', icon: SquareChartGantt },
]
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

      <!-- Tabs (segmented control, bisa di-scroll horizontal di layar kecil) -->
      <div class="shrink-0 overflow-x-auto border-b border-border-subtle px-space-xl py-space-sm">
        <div role="tablist" class="inline-flex w-max gap-1 rounded-lg bg-bg-canvas p-1">
          <button
v-for="item in tabs" :key="item.value" type="button" role="tab" :aria-selected="tab === item.value"
            class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 font-label-md text-label-md outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50"
            :class="tab === item.value
              ? 'bg-background text-primary shadow-xs'
              : 'text-text-secondary hover:text-text-primary'" @click="emits('update:tab', item.value)">
            <component :is="item.icon" class="size-4" aria-hidden="true" />
            {{ item.label }}
          </button>
        </div>
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
          <!-- TAB ODONTOGRAM -->
          <div v-if="tab === 'odontogram'" class="flex flex-col gap-space-md">
            <!-- Ringkasan -->
            <div class="grid grid-cols-2 gap-space-sm">
              <div class="flex flex-col gap-0.5 rounded-lg bg-bg-canvas p-space-md">
                <span class="font-caption text-caption uppercase tracking-wider text-text-muted">Gigi sehat</span>
                <span class="font-headline-md text-headline-md font-bold text-text-primary">
                  {{ detail.healthyTeeth }}<span class="text-text-muted"> / {{ totalPermanentTeeth }}</span>
                </span>
              </div>
              <div class="flex flex-col gap-0.5 rounded-lg bg-bg-canvas p-space-md">
                <span class="font-caption text-caption uppercase tracking-wider text-text-muted">Skor DMFT</span>
                <span class="font-headline-md text-headline-md font-bold text-text-primary">{{ detail.dmftScore
                  }}</span>
              </div>
            </div>

            <!-- Peta gigi: scroll horizontal di layar sempit -->
            <div class="overflow-x-auto rounded-lg border border-border-subtle p-space-md">
              <div class="flex min-w-[720px] flex-col gap-space-md">
                <div v-for="arch in arches" :key="arch.jaw" class="flex flex-col gap-1.5">
                  <span class="font-table-header text-table-header uppercase tracking-wider text-text-muted">{{ arch.jaw
                    }}</span>
                  <div class="flex items-stretch">
                    <div
v-for="(half, halfIndex) in [arch.teeth.slice(0, 8), arch.teeth.slice(8)]"
                      :key="half.join('-')" class="grid flex-1 grid-cols-8 gap-1.5"
                      :class="halfIndex === 0 ? 'pr-1.5' : 'border-l border-dashed border-border-subtle pl-1.5'">
                      <div
v-for="fdiNumber in half" :key="fdiNumber"
                        class="flex min-w-0 flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center"
                        :class="toothConditionClass[conditionOf(fdiNumber)]">
                        <span class="font-label-sm text-label-sm font-semibold leading-none">{{ fdiNumber }}</span>
                        <span
class="size-5 rounded-b-md rounded-t-full bg-current opacity-70"
                          :class="conditionOf(fdiNumber) === 'hilang' ? 'opacity-25' : ''" aria-hidden="true" />
                        <span class="font-caption text-[10px] leading-none opacity-80">{{
                          toothConditionLabel[conditionOf(fdiNumber)].split(' ')[0] }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Legenda -->
            <div
              class="grid grid-cols-2 gap-x-space-md gap-y-2 rounded-lg bg-bg-canvas p-space-md sm:grid-cols-3 lg:grid-cols-4">
              <span
v-for="condition in toothConditionOrder" :key="condition"
                class="flex items-center gap-1.5 font-caption text-caption text-text-secondary">
                <span
class="size-3 shrink-0 rounded-full" :class="toothConditionSwatch[condition]"
                  aria-hidden="true" />
                <span class="min-w-0 flex-1 truncate">{{ toothConditionLabel[condition] }}</span>
                <span class="font-semibold text-text-primary">{{ countOf(condition) }}</span>
              </span>
            </div>

            <!-- Kondisi gigi tercatat -->
            <div class="flex flex-col gap-2 rounded-lg border border-border-subtle p-space-md">
              <h3 class="font-label-md text-label-md font-semibold text-text-primary">Kondisi gigi tercatat</h3>
              <p v-if="notedTeeth.length === 0" class="font-body-sm text-body-sm text-text-secondary">
                Seluruh gigi tercatat sehat pada pemeriksaan ini.
              </p>
              <ul v-else class="flex flex-col divide-y divide-border-subtle">
                <li
v-for="tooth in notedTeeth" :key="tooth.id"
                  class="flex flex-wrap items-center gap-x-2 gap-y-1 py-2 font-body-sm text-body-sm first:pt-0 last:pb-0">
                  <span class="font-semibold text-text-primary">Gigi {{ tooth.fdiNumber }}</span>
                  <span class="text-text-muted">{{ toothNameOf(tooth.fdiNumber) }}</span>
                  <span
class="shrink-0 rounded border px-1.5 py-0.5 text-[11px] font-semibold"
                    :class="toothConditionClass[tooth.condition]">
                    {{ toothConditionLabel[tooth.condition] }}
                  </span>
                  <span v-if="tooth.note" class="min-w-0 basis-full text-text-secondary sm:basis-auto">— {{ tooth.note
                    }}</span>
                </li>
              </ul>
            </div>

            <!-- Pemeriksaan klinis -->
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
            </dl>
          </div>

          <!-- TAB OHI-S -->
          <div v-else class="flex flex-col gap-space-md">
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
          </div>
        </template>
      </div>

      <!-- Footer: selalu terlihat di kedua tab -->
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
