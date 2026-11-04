<script setup lang="ts">
import type { Component } from 'vue'
import type { CareTaskSession } from '~~/shared/schemas/patient-care.schema'
import type { CareSessionFilter, CareTaskDto } from '~~/shared/types/care'
import {
  CARE_HEAT_WINDOW_DAYS,
  careGroupOf,
  careSessionLabel,
  careTaskSessionOrder,
  OHIS_TARGET_MAX,
  STREAK_BONUS_DAYS,
} from '~~/shared/types/care'
import { ohisCategoryLabel } from '~~/shared/types/patient'
import { CalendarDays, ChevronRight, ListChecks, RotateCcw, Smile, Sparkles, TriangleAlert } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useCareChecklistQuery, useToggleCareTaskMutation } from '~/composables/queries/usePatientCareQueries'
import { formatUtcLongDate } from '~/lib/format'

interface CareMetricCardView {
  label: string
  value: string
  icon: Component
  progressPercent: number
  progressClass?: string
  caption?: string
  chip?: string
  trend?: { text: string, direction: 'up' | 'down' }
  footerLeft?: string
  footerRight?: string
}

definePageMeta({ layout: 'patient', title: 'Checklist Kepatuhan' })

const checklistQuery = useCareChecklistQuery()
const toggleMutation = useToggleCareTaskMutation()

const checklist = computed(() => checklistQuery.data.value?.data ?? null)
const isLoading = computed(() => checklistQuery.isPending.value)
const errorText = computed(() =>
  checklistQuery.error.value
    ? (checklistQuery.error.value as { statusMessage?: string }).statusMessage
      ?? 'Checklist kepatuhan sedang tidak dapat dimuat.'
    : '')

// Kunci tanggal diambil dari server, bukan jam perangkat, agar hari yang dipilih tidak melompat
// untuk pasien yang membuka portal di luar WIB.
const selectedDate = ref('')
const sessionFilter = ref<CareSessionFilter>('all')

watch(checklist, (dto) => {
  if (dto && !selectedDate.value) selectedDate.value = dto.today
}, { immediate: true })

const dayTasks = computed(() => {
  const dto = checklist.value
  if (!dto) return []
  return dto.tasks.filter(task =>
    task.date === selectedDate.value
    && (sessionFilter.value === 'all' || task.session === sessionFilter.value))
})

const groups = computed(() => careGroupOf(dayTasks.value))
const hasTasks = computed(() => (checklist.value?.tasks.length ?? 0) > 0)
const selectableDates = computed(() => checklist.value?.days.map(day => day.date) ?? [])
const pendingTaskKey = computed(() => {
  // `variables` tetap terisi setelah mutation selesai, jadi tanpa penjagaan ini kartu
  // terakhir yang disimpan akan berhenti menampilkan tombol dan selamanya "Menyimpan...".
  if (!toggleMutation.isPending.value) return null
  const variables = toggleMutation.variables.value
  return variables ? `${variables.taskId}|${variables.date}` : null
})

function pendingSessionLabel(pending: Record<CareTaskSession, number>) {
  const busiest = careTaskSessionOrder.reduce<CareTaskSession | null>(
    (best, session) => (pending[session] > 0 && (best === null || pending[session] > pending[best]) ? session : best),
    null,
  )
  return busiest ? `Sesi ${careSessionLabel[busiest]} ${pending[busiest]}` : 'Semua sesi tuntas'
}

const metricCards = computed<CareMetricCardView[]>(() => {
  const dto = checklist.value
  if (!dto) return []
  const { weekly, today, streak, ohis } = dto.metrics
  const pendingTotal = Math.max(0, today.total - today.done)
  const remainingSession = pendingSessionLabel(today.pendingBySession)
  const streakProgress = Math.min(100, (streak.days / STREAK_BONUS_DAYS) * 100)
  const ohisProgress = ohis.current === null || ohis.current <= 0
    ? 0
    : Math.min(100, Math.round((OHIS_TARGET_MAX / ohis.current) * 1000) / 10)

  return [
    {
      label: 'Kepatuhan Mingguan',
      value: `${weekly.percent}%`,
      icon: CalendarDays,
      progressPercent: weekly.percent,
      progressClass: weekly.percent >= weekly.targetPercent ? 'bg-status-success' : 'bg-status-warning',
      // Delta 0 bukan kenaikan: tanpa penjagaan ini pil "0 poin" berikon TrendingUp.
      trend: weekly.deltaPoints === null || weekly.deltaPoints === 0 || !hasTasks.value
        ? undefined
        : {
            text: `${weekly.deltaPoints > 0 ? '+' : ''}${weekly.deltaPoints} poin`,
            direction: weekly.deltaPoints >= 0 ? 'up' as const : 'down' as const,
          },
      footerLeft: `Target klinik: ≥${weekly.targetPercent}%`,
      footerRight: `${weekly.done}/${weekly.total} Selesai`,
    },
    {
      label: 'Tugas Hari Ini',
      value: hasTasks.value ? `${today.done} / ${today.total}` : '0 / 0',
      icon: ListChecks,
      progressPercent: today.percent,
      progressClass: pendingTotal === 0 && today.total > 0 ? 'bg-status-success' : 'bg-primary-container',
      // Tanpa tugas, "Semua tugas tercatat selesai" adalah klaim kosong: yang benar belum ada apa-apa.
      footerLeft: today.total === 0
        ? 'Belum ada tugas untuk hari ini'
        : pendingTotal > 0 ? `${pendingTotal} tugas tersisa` : 'Semua tugas tercatat selesai',
      footerRight: today.total === 0 ? 'Menunggu instruksi DPJP' : remainingSession,
    },
    {
      label: 'Runtun Disiplin',
      value: String(streak.days),
      icon: Sparkles,
      progressPercent: streakProgress,
      progressClass: streak.bonusActive ? 'bg-tertiary' : 'bg-status-warning',
      caption: 'hari berturut-turut penuh',
      chip: streak.bonusActive ? 'Bonus Disiplin Perawatan Aktif' : undefined,
      footerLeft: `Bonus aktif setelah ${STREAK_BONUS_DAYS} hari beruntun`,
      footerRight: `${streak.days} hari 100% tuntas`,
    },
    {
      label: 'Indeks OHI-S Pasca-Tindakan',
      value: ohis.current === null ? '-' : ohis.current.toFixed(2),
      icon: Smile,
      progressPercent: ohisProgress,
      progressClass: ohis.targetMet ? 'bg-status-success' : 'bg-primary-container',
      caption: ohis.category ? `(${ohisCategoryLabel[ohis.category]})` : '(Belum dinilai)',
      footerLeft: `Target < ${OHIS_TARGET_MAX.toFixed(2)} (Baik)`,
      footerRight: ohis.delta === null || ohis.baseline === null
        ? 'Belum ada nilai awal program pemantauan.'
        : `${ohis.delta > 0 ? '+' : ''}${ohis.delta.toFixed(2)} dari baseline ${ohis.baseline.toFixed(2)}`,
    },
  ]
})

const selectedDateLabel = computed(() =>
  selectedDate.value ? formatUtcLongDate(`${selectedDate.value}T00:00:00.000Z`) : 'Hari ini')

const summaryText = computed(() => {
  const dto = checklist.value
  if (!dto) return ''
  return `Kepatuhan mingguan ${dto.metrics.weekly.percent} persen, tugas hari ini ${dto.metrics.today.done} dari ${dto.metrics.today.total} selesai, runtun disiplin ${dto.metrics.streak.days} hari, indeks OHI-S terkini ${dto.metrics.ohis.current ?? 'belum dinilai'}.`
})

function toggleTask(task: CareTaskDto, done: boolean) {
  toggleMutation.mutate({ taskId: task.taskId, date: task.date, done })
}

const isRecapPending = ref(false)
async function recapToday() {
  isRecapPending.value = true
  try {
    const result = await checklistQuery.refetch()
    const dto = result.data?.data
    if (!dto) {
      toast.error('Rekap gagal dimuat. Periksa koneksi lalu coba lagi.')
      return
    }
    toast.success(
      `${dto.metrics.today.done} dari ${dto.metrics.today.total} tugas hari ini tercatat (${dto.metrics.today.percent}%). `
      + `Runtun disiplin ${dto.metrics.streak.days} hari, riwayat ${CARE_HEAT_WINDOW_DAYS} hari: `
      + `${dto.heat.disciplinePercent ?? 0}% disiplin.`,
    )
  }
  finally {
    isRecapPending.value = false
  }
}
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1600px] flex-col gap-space-lg p-space-xl">
    <div class="flex flex-wrap items-end justify-between gap-space-md">
      <div class="flex min-w-0 flex-col gap-1">
        <p class="flex items-center font-body-sm text-body-sm text-text-muted">
          <span>Portal Pasien</span>
          <ChevronRight class="size-4" aria-hidden="true" />
          <span class="font-body-lg text-body-lg text-primary">Checklist Kepatuhan</span>
        </p>
        <h1 class="font-headline-lg text-headline-lg font-bold tracking-tight text-text-primary">
          Checklist Kepatuhan &amp; Perawatan Mandiri
        </h1>
        <p class="font-body-md text-body-md text-text-secondary">
          {{ checklist?.patientName ?? 'Pasien' }} · RM {{ checklist?.medicalRecordNo ?? '-' }} ·
          {{ checklist?.programName ?? 'Belum terdaftar dalam program pemantauan klinik' }}
        </p>
      </div>

      <Button class="gap-2" :disabled="isRecapPending || isLoading || !hasTasks" @click="recapToday">
        <RotateCcw class="size-4" aria-hidden="true" />
        {{ isRecapPending ? 'Memuat ulang...' : 'Simpan & Rekap Progres Hari Ini' }}
      </Button>
    </div>

    <div
      v-if="checklistQuery.isError.value"
      class="flex flex-col items-center gap-space-md rounded-xl border border-border-subtle bg-surface-card p-space-2xl text-center shadow-sm"
    >
      <span class="flex size-12 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger">
        <TriangleAlert class="size-6" aria-hidden="true" />
      </span>
      <div class="flex flex-col gap-1">
        <span class="font-headline-md text-headline-md text-text-primary">Checklist belum dapat dibuka</span>
        <p class="max-w-md font-body-md text-body-md text-text-secondary">{{ errorText }}</p>
      </div>
      <Button variant="outline" class="gap-2" :disabled="checklistQuery.isFetching.value" @click="checklistQuery.refetch()">
        <RotateCcw class="size-4" aria-hidden="true" />
        Coba muat lagi
      </Button>
    </div>

    <template v-else>
      <p class="sr-only">{{ summaryText }}</p>

      <div class="grid gap-space-md sm:grid-cols-2 xl:grid-cols-4">
        <template v-if="isLoading || metricCards.length === 0">
          <Skeleton v-for="row in 4" :key="row" class="h-44 w-full rounded-xl" />
        </template>
        <template v-else>
          <PatientCareMetricCard
            v-for="card in metricCards"
            :key="card.label"
            v-bind="card"
          />
        </template>
      </div>

      <div
        v-if="!isLoading && !hasTasks"
        class="flex flex-col items-center gap-space-md rounded-xl border border-border-subtle bg-surface-card p-space-2xl text-center shadow-sm"
      >
        <span class="flex size-14 items-center justify-center rounded-xl bg-surface-container text-text-secondary">
          <ListChecks class="size-7" aria-hidden="true" />
        </span>
        <div class="flex flex-col gap-1">
          <span class="font-headline-md text-headline-md text-text-primary">
            Belum ada instruksi mandiri dari DPJP
          </span>
          <p class="max-w-md font-body-md text-body-md text-text-secondary">
            Dokter penanggung jawab belum menetapkan tugas perawatan mandiri untuk rekam medis ini.
            Pantangan pasca-tindakan di bawah tetap berlaku.
          </p>
        </div>
        <Button as-child variant="outline" class="gap-2">
          <NuxtLink to="/pasien/dashboard">
            Kembali ke Portal Pasien
            <ChevronRight class="size-4" aria-hidden="true" />
          </NuxtLink>
        </Button>
      </div>

      <div v-else class="grid items-start gap-space-lg lg:grid-cols-[minmax(0,1fr)_340px]">
        <div class="flex flex-col gap-space-lg">
          <Skeleton v-if="isLoading" class="h-28 w-full rounded-xl" />
          <PatientCareDayStrip
            v-else
            :days="checklist?.days ?? []"
            :selected-date="selectedDate"
            :session-filter="sessionFilter"
            @select="selectedDate = $event"
            @filter="sessionFilter = $event"
          />

          <p class="flex items-center gap-2 font-label-md text-label-md text-text-secondary">
            <CalendarDays class="size-4 text-primary" aria-hidden="true" />
            Daftar tugas {{ selectedDateLabel }}
            <span v-if="sessionFilter !== 'all'" class="rounded-full bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-text-secondary">
              Filter: {{ careSessionLabel[sessionFilter] }}
            </span>
          </p>

          <div v-if="isLoading" class="flex flex-col gap-space-lg">
            <Skeleton v-for="row in 3" :key="row" class="h-40 w-full rounded-xl" />
          </div>
          <div v-else-if="groups.length === 0" class="flex flex-col gap-space-md">
            <p class="rounded-xl border border-border-subtle bg-surface-card p-space-lg font-body-md text-body-md text-text-secondary shadow-sm">
              {{ sessionFilter === 'all'
                ? 'Tidak ada tugas pada tanggal ini. Pilih hari lain pada strip di atas.'
                : `Tidak ada tugas sesi ${careSessionLabel[sessionFilter]} pada tanggal ini.` }}
            </p>
          </div>
          <template v-else>
            <PatientCareSessionGroup
              v-for="group in groups"
              :key="group.session"
              :group="group"
              :pending-task-key="pendingTaskKey"
              @toggle="toggleTask"
            />
          </template>
        </div>

        <div class="flex flex-col gap-space-lg">
          <PatientCareDisciplinePanel
            :cells="checklist?.heat.cells ?? []"
            :discipline-percent="checklist?.heat.disciplinePercent ?? null"
            :doctor-note="checklist?.doctorNote ?? { note: null, clinician: null, validatedAt: null }"
            :selected-date="selectedDate"
            :selectable-dates="selectableDates"
            :is-pending="isLoading"
            @select="selectedDate = $event"
          />
          <PatientCareRestrictionPanel />
        </div>
      </div>
    </template>
  </section>
</template>
