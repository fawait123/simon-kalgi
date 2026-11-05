<script setup lang="ts">
import type { Component } from 'vue'
import type { OhisCategory } from '@prisma/client'
import type { CareTaskDto } from '~~/shared/types/care'
import { ohisCategoryLabel, ohisProgressClass } from '~~/shared/types/patient'
import { OHIS_TARGET_MAX } from '~~/shared/types/care'
import { CalendarClock, ListChecks, RotateCcw, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-vue-next'
import { useCareChecklistQuery, useToggleCareTaskMutation } from '~/composables/queries/usePatientCareQueries'
import { usePatientProfileQuery } from '~/composables/queries/usePatientProfileQueries'
import { usePatientExamDetailQuery, usePatientExamSessionsQuery } from '~/composables/queries/usePatientRecordQueries'
import { formatShortDateId, formatUtcLongDate } from '~/lib/format'

interface DashboardMetricCardView {
  label: string
  value: string
  icon: Component
  progressPercent: number
  progressClass?: string
  caption?: string
  trend?: { text: string, direction: 'up' | 'down' }
  chip?: string
  footerLeft?: string
  footerRight?: string
}

definePageMeta({ layout: 'patient', title: 'Dashboard' })

const profileQuery = usePatientProfileQuery()
const checklistQuery = useCareChecklistQuery()
const sessionsQuery = usePatientExamSessionsQuery()
const toggleMutation = useToggleCareTaskMutation()

const profile = computed(() => profileQuery.data.value?.data ?? null)
const checklist = computed(() => checklistQuery.data.value?.data ?? null)
const sessions = computed(() => sessionsQuery.data.value?.data ?? [])
const latestId = computed(() => sessionsQuery.data.value?.meta.latestId ?? null)

const detailQuery = usePatientExamDetailQuery(() => latestId.value)
const detail = computed(() => detailQuery.data.value?.data ?? null)

const isLoading = computed(() => profileQuery.isPending.value)
const errorText = computed(() =>
  profileQuery.error.value
    ? (profileQuery.error.value as { statusMessage?: string }).statusMessage
      ?? 'Ringkasan dashboard Anda sedang tidak dapat dimuat.'
    : '')

const firstName = computed(() => profile.value?.fullName.split(/\s+/)[0] ?? 'Pasien')

const ohisCategory = computed<OhisCategory | null>(
  () => checklist.value?.metrics.ohis.category ?? profile.value?.ohisCategory ?? null)

function daysUntil(iso: string | null) {
  if (!iso) return null
  const target = new Date(iso)
  if (Number.isNaN(target.getTime())) return null
  const startOfDay = (input: Date) =>
    new Date(input.getFullYear(), input.getMonth(), input.getDate()).getTime()
  return Math.round((startOfDay(target) - startOfDay(new Date())) / 86_400_000)
}

const nextVisitDays = computed(() => daysUntil(profile.value?.nextVisitAt ?? null))

function calculusBand(score: number) {
  if (score <= 0) return { text: 'Bersih', barClass: 'bg-status-success' }
  if (score <= 1) return { text: 'Terkontrol', barClass: 'bg-status-success' }
  if (score <= 2) return { text: 'Perlu Perhatian', barClass: 'bg-status-warning' }
  return { text: 'Berat', barClass: 'bg-status-danger' }
}

const metricCards = computed<DashboardMetricCardView[]>(() => {
  const cards: DashboardMetricCardView[] = []

  const ohis = checklist.value?.metrics.ohis ?? null
  const score = ohis?.current ?? profile.value?.ohisScore ?? null
  const category = ohisCategory.value
  cards.push({
    label: 'Indeks Kebersihan Gigi (OHI-S)',
    value: score === null ? '-' : score.toFixed(2),
    icon: Sparkles,
    progressPercent: score === null ? 0 : Math.min(100, (score / 6) * 100),
    progressClass: category ? ohisProgressClass[category] : undefined,
    caption: category ? `Skor ${ohisCategoryLabel[category]}` : 'Belum dinilai',
    trend: ohis?.delta != null && ohis.delta < 0
      ? { text: `Membaik ${ohis.delta.toFixed(2)}`, direction: 'up' }
      : undefined,
    footerLeft: `Target < ${OHIS_TARGET_MAX.toFixed(2)} (Baik)`,
    footerRight: ohis?.baseline != null ? `Baseline ${ohis.baseline.toFixed(2)}` : undefined,
  })

  const calculus = detail.value?.calculusIndex ?? null
  const band = calculus === null ? null : calculusBand(calculus)
  cards.push({
    label: 'Status Karang Gigi (Kalkulus)',
    value: band?.text ?? 'Menunggu Data',
    icon: ShieldCheck,
    progressPercent: calculus === null ? 0 : Math.min(100, (calculus / 3) * 100),
    progressClass: band?.barClass,
    caption: calculus === null ? undefined : `Skor CI-S ${calculus.toFixed(2)}`,
    footerLeft: 'Tindakan terakhir:',
    footerRight: sessions.value[0] ? formatShortDateId(sessions.value[0].examDate) : 'Belum ada',
  })

  const visitDate = profile.value?.nextVisitAt ?? null
  const days = nextVisitDays.value
  cards.push({
    label: 'Jadwal Kontrol Terdekat',
    value: visitDate ? formatShortDateId(visitDate) : 'Belum Terjadwal',
    icon: CalendarClock,
    progressPercent: days === null ? 0 : Math.max(0, Math.min(100, 100 - (days / 30) * 100)),
    caption: days === null
      ? 'Menunggu penjadwalan DPJP'
      : days === 0 ? 'Hari Ini' : days > 0 ? `${days} Hari Lagi` : 'Melewati Jadwal',
    footerLeft: profile.value?.controlTitle ?? 'Kontrol rutin sesuai arahan DPJP',
    footerRight: profile.value?.nextVisitClinician ?? undefined,
  })

  const weekly = checklist.value?.metrics.weekly ?? null
  cards.push({
    label: 'Kepatuhan Perawatan Mandiri',
    value: weekly ? `${weekly.percent}%` : '-',
    icon: ListChecks,
    progressPercent: weekly?.percent ?? 0,
    progressClass: weekly && weekly.percent >= weekly.targetPercent ? 'bg-status-success' : 'bg-status-warning',
    caption: weekly
      ? weekly.percent >= weekly.targetPercent ? 'Tercapai Sangat Baik' : 'Menuju Target Klinik'
      : 'Belum ada data',
    footerLeft: weekly ? `${weekly.done}/${weekly.total} tugas selesai minggu ini` : 'Menunggu program pemantauan',
    footerRight: weekly ? `Target ≥${weekly.targetPercent}%` : undefined,
  })

  return cards
})

const todayTasks = computed<CareTaskDto[]>(() => {
  const dto = checklist.value
  if (!dto) return []
  return dto.tasks.filter(task => task.date === dto.today)
})

const pendingTaskKey = computed(() => {
  if (!toggleMutation.isPending.value) return null
  const variables = toggleMutation.variables.value
  return variables ? `${variables.taskId}|${variables.date}` : null
})

const checklistDateLabel = computed(() =>
  checklist.value ? formatUtcLongDate(`${checklist.value.today}T00:00:00.000Z`) : 'Hari ini')

function toggleTask(task: CareTaskDto, done: boolean) {
  toggleMutation.mutate({ taskId: task.taskId, date: task.date, done })
}
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1600px] flex-col gap-space-lg p-space-xl">
    <div
      v-if="profileQuery.isError.value"
      class="flex flex-col items-center gap-space-md rounded-xl border border-border-subtle bg-surface-card p-space-2xl text-center shadow-sm"
    >
      <span class="flex size-12 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger">
        <TriangleAlert class="size-6" aria-hidden="true" />
      </span>
      <div class="flex flex-col gap-1">
        <span class="font-headline-md text-headline-md text-text-primary">Dashboard belum dapat dibuka</span>
        <p class="max-w-md font-body-md text-body-md text-text-secondary">{{ errorText }}</p>
      </div>
      <Button variant="outline" class="gap-2" :disabled="profileQuery.isFetching.value" @click="profileQuery.refetch()">
        <RotateCcw class="size-4" aria-hidden="true" />
        Coba muat lagi
      </Button>
    </div>

    <template v-else>
      <PatientDashboardGreetingCard
        :first-name="firstName"
        :ohis-category="ohisCategory"
        :updated-at="profile?.updatedAt ?? null"
        :has-schedule="Boolean(profile?.nextVisitAt)"
      />

      <div class="grid gap-space-md sm:grid-cols-2 xl:grid-cols-4">
        <template v-if="isLoading">
          <Skeleton v-for="row in 4" :key="row" class="h-44 w-full rounded-xl" />
        </template>
        <template v-else>
          <PatientCareMetricCard v-for="card in metricCards" :key="card.label" v-bind="card" />
        </template>
      </div>

      <div class="grid items-start gap-space-lg lg:grid-cols-12">
        <div class="flex flex-col gap-space-lg lg:col-span-7">
          <PatientDashboardTrendCard
            :sessions="sessions"
            :target-date="profile?.nextVisitAt ?? null"
          />

          <Skeleton
            v-if="sessionsQuery.isPending.value || (latestId && detailQuery.isPending.value)"
            class="h-96 w-full rounded-xl"
          />
          <PatientDashboardLastExamCard v-else-if="detail" :detail="detail" />
          <div
            v-else
            class="flex flex-col items-center gap-space-md rounded-xl border border-border-subtle bg-surface-card p-space-2xl text-center shadow-sm"
          >
            <span class="flex size-14 items-center justify-center rounded-xl bg-surface-container text-text-secondary">
              <CalendarClock class="size-7" aria-hidden="true" />
            </span>
            <p class="max-w-md font-body-md text-body-md text-text-secondary">
              Rekam medis pemeriksaan akan muncul di sini setelah dokter memfinalisasi kunjungan Anda.
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-space-lg lg:col-span-5">
          <PatientDashboardChecklistCard
            :tasks="todayTasks"
            :date-label="checklistDateLabel"
            :pending-task-key="pendingTaskKey"
            :is-loading="checklistQuery.isPending.value"
            @toggle="toggleTask"
          />

          <PatientDashboardPlanCard
            :plan-of-action="detail?.planOfAction ?? []"
            :prescription-note="detail?.prescriptionNote ?? null"
            :next-visit-label="profile?.nextVisitAt ? formatShortDateId(profile.nextVisitAt) : null"
            :is-loading="detailQuery.isPending.value && Boolean(latestId)"
          />

          <PatientDashboardEducationCard />

          <PatientDashboardDoctorNoteCard
            :doctor-note="checklist?.doctorNote ?? { note: null, clinician: null, validatedAt: null }"
            :dpjp-name="checklist?.dpjpName ?? profile?.nextVisitClinician ?? null"
          />
        </div>
      </div>
    </template>
  </section>
</template>
