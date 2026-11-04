<script setup lang="ts">
import type { ExaminationDetailDto, ExaminationToothDto } from '~~/shared/types/examination'
import { ChevronRight, Printer } from 'lucide-vue-next'
import {
  usePatientExamDetailQuery,
  usePatientExamSessionsQuery,
} from '~/composables/queries/usePatientRecordQueries'
import { printExaminationResume } from '~/lib/print'

definePageMeta({ layout: 'patient', title: 'Pemeriksaan Gigi' })

const sessionsQuery = usePatientExamSessionsQuery()
const sessions = computed(() => sessionsQuery.data.value?.data ?? [])
const latestId = computed(() => sessionsQuery.data.value?.meta.latestId ?? null)

const selectedSessionId = ref<string | null>(null)
const selectedFdi = ref<number | null>(null)

const detailQuery = usePatientExamDetailQuery(() => selectedSessionId.value)
const detail = computed(() => detailQuery.data.value?.data ?? null)

const sessionErrorText = computed(() =>
  sessionsQuery.error.value
    ? (sessionsQuery.error.value as { statusMessage?: string }).statusMessage
      ?? 'Riwayat pemeriksaan Anda tidak dapat dijangkau.'
    : undefined)

/** Gigi tanpa baris tetap bisa dibuka: kondisinya sehat, catatannya kosong. */
const selectedTooth = computed<ExaminationToothDto | null>(() => {
  if (!detail.value || selectedFdi.value === null) return null
  const fdiNumber = selectedFdi.value
  return detail.value.teeth.find(tooth => tooth.fdiNumber === fdiNumber)
    ?? { id: `virtual-${fdiNumber}`, fdiNumber, condition: 'sehat', note: null }
})

function firstRecordedFdi(exam: ExaminationDetailDto) {
  return exam.teeth.find(tooth => tooth.condition !== 'sehat')?.fdiNumber ?? exam.teeth[0]?.fdiNumber ?? null
}

watch(latestId, (id) => {
  if (id && !selectedSessionId.value) selectedSessionId.value = id
}, { immediate: true })

// Kunci ganti sesi = seleksi gigi harus ikut pindah, kalau tidak kartu detail menunjuk FDI
// yang mungkin hanya ada pada sesi sebelumnya.
watch(detail, (exam) => {
  selectedFdi.value = exam ? firstRecordedFdi(exam) : null
})
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1400px] flex-col gap-space-lg p-space-xl">
    <div class="flex flex-col justify-between gap-space-md lg:flex-row lg:items-end">
      <div class="flex flex-col gap-1">
        <p class="flex items-center gap-1 font-body-sm text-body-sm text-text-muted">
          <span>Portal</span>
          <ChevronRight class="size-4" aria-hidden="true" />
          <span class="font-body-lg text-body-lg text-primary">Pemeriksaan Gigi</span>
        </p>
        <h1 class="font-headline-lg text-headline-lg font-bold tracking-tight text-text-primary">
          Hasil Pemeriksaan Gigi &amp; Odontogram
        </h1>
        <p class="max-w-2xl font-body-md text-body-md text-text-secondary">
          Rekam medis kondisi gigi Anda, indeks kebersihan rongga mulut (OHI-S), dan rencana perawatan
          yang dicatat dokter pada setiap kunjungan.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        class="flex shrink-0 items-center gap-1.5 self-start rounded-lg font-label-md text-label-md lg:self-auto"
        :disabled="!detail"
        @click="detail && printExaminationResume(detail)"
      >
        <Printer class="size-4" aria-hidden="true" />
        Cetak Resume Medis
      </Button>
    </div>

    <div class="grid grid-cols-1 gap-space-lg lg:grid-cols-[320px_minmax(0,1fr)]">
      <div class="lg:sticky lg:top-20 lg:self-start">
        <PatientRecordSessionList
          :items="sessions"
          :selected-id="selectedSessionId"
          :is-pending="sessionsQuery.isPending.value"
          :is-error="sessionsQuery.isError.value"
          :error-text="sessionErrorText"
          @select="selectedSessionId = $event"
          @retry="() => sessionsQuery.refetch()"
        />
      </div>

      <div class="flex flex-col gap-space-lg">
        <div
          v-if="detailQuery.isError.value"
          class="flex flex-col items-center gap-2 rounded-xl border border-border-subtle bg-surface-card p-space-2xl text-center shadow-sm"
        >
          <p class="font-body-md text-body-md text-status-danger">
            Rekam medis kunjungan ini gagal dimuat dari basis data klinik.
          </p>
          <Button type="button" variant="outline" size="sm" class="rounded-lg" @click="() => detailQuery.refetch()">
            Muat ulang
          </Button>
        </div>

        <div
          v-else-if="selectedSessionId && detailQuery.isPending.value"
          class="flex flex-col gap-space-lg"
          aria-busy="true"
        >
          <Skeleton class="h-72 w-full rounded-xl" />
          <Skeleton class="h-40 w-full rounded-xl" />
          <Skeleton class="h-64 w-full rounded-xl" />
        </div>

        <div
          v-else-if="!detail"
          class="flex flex-col items-center gap-2 rounded-xl border border-border-subtle bg-surface-card p-space-2xl text-center shadow-sm"
        >
          <p class="font-body-md text-body-md text-text-secondary">
            {{ sessions.length === 0
              ? 'Rekam medis pemeriksaan gigi akan muncul di sini setelah dokter memfinalisasi kunjungan Anda.'
              : 'Pilih salah satu sesi kunjungan di sebelah kiri untuk membuka rekam medisnya.' }}
          </p>
        </div>

        <template v-else>
          <PatientRecordOdontogram
            :teeth="detail.teeth"
            :selected-fdi="selectedFdi"
            :healthy-teeth="detail.healthyTeeth"
            :dmft-score="detail.dmftScore"
            @select="selectedFdi = $event"
          />
          <PatientRecordToothDetail :tooth="selectedTooth" />
          <PatientRecordOhisPanel :detail="detail" />
          <PatientRecordConditionCards :detail="detail" />
          <PatientRecordNextVisitCard :detail="detail" />
        </template>
      </div>
    </div>
  </section>
</template>
