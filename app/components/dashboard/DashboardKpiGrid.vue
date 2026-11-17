<script setup lang="ts">
import type { DashboardSummaryDto } from '~~/shared/types/dashboard'
import {
  CalendarClock,
  ClipboardList,
  Layers,
  Sparkles,
  Stethoscope,
  TriangleAlert,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-vue-next'
import { isRouteAllowed } from '~~/shared/config/access'

const props = defineProps<{
  summary?: DashboardSummaryDto | null
  isPending?: boolean
}>()

const { user } = useAuthSession()
const canOpenPatientData = computed(() => isRouteAllowed('/admin/pasien', user.value))
const canOpenMonitoring = computed(() => isRouteAllowed('/admin/monitoring', user.value))

const patients = computed(() => props.summary?.patients ?? {
  total: 0,
  thisMonth: 0,
  lastMonth: 0,
  adult: 0,
  withCalculus: 0,
  scalingDone: 0,
  needControl: 0,
})
const workers = computed(() => props.summary?.workers ?? { active: 0, dentists: 0, nurses: 0 })
const examinations = computed(() => props.summary?.examinations ?? {
  total: 0,
  last7Days: 0,
  clinicalActionNeeded: 0,
})

/** Pertumbuhan pasien baru bulan ini vs bulan lalu; bulan lalu kosong berarti bukan persen. */
const patientGrowth = computed(() => {
  const { thisMonth, lastMonth } = patients.value
  if (lastMonth === 0) {
    return {
      delta: null as string | null,
      caption: thisMonth === 0 ? 'Belum ada pasien baru bulan ini' : 'pasien baru bulan ini',
      up: false,
    }
  }
  const percent = Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
  return {
    delta: percent === 0 ? '0%' : `${percent > 0 ? '+' : ''}${percent}%`,
    caption: 'vs. bulan lalu',
    up: percent > 0,
  }
})
</script>

<template>
  <div class="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
    <template v-if="isPending">
      <Skeleton v-for="index in 8" :key="`kpi-${index}`" class="h-[150px] w-full rounded-xl" />
    </template>

    <template v-else>
      <DashboardKpiCard label="Pasien Dewasa" :value="patients.adult" :icon="Users">
        <template #footer>
          <div class="flex items-center justify-between gap-2">
            <span class="text-label-md font-bold text-primary">≥ 18 tahun</span>
            <span class="text-caption text-text-muted">dari {{ patients.total }} terdaftar</span>
          </div>
        </template>
      </DashboardKpiCard>

      <DashboardKpiCard
label="Pasien dengan Kalkulus" :value="patients.withCalculus" :icon="Layers"
        value-class="text-status-warning">
        <template #footer>
          <div class="flex items-center justify-between gap-2">
            <span class="text-caption font-semibold text-status-warning">CI-S &gt; 0</span>
            <span class="text-caption text-text-muted">skor terakhir pasien</span>
          </div>
        </template>
      </DashboardKpiCard>

      <DashboardKpiCard
label="Pasien Sudah Scaling" :value="patients.scalingDone" :icon="Sparkles"
        value-class="text-status-success">
        <template #footer>
          <div class="flex items-center justify-between gap-2">
            <span class="text-caption font-semibold text-status-success">Tindakan tercatat</span>
            <span class="text-caption text-text-muted">pemeriksaan final</span>
          </div>
        </template>
      </DashboardKpiCard>

      <DashboardKpiCard
label="Pasien Perlu Kontrol" :value="patients.needControl" :icon="CalendarClock"
        value-class="text-status-danger">
        <template #footer>
          <div class="flex items-center justify-between gap-2">
            <span class="text-caption font-semibold text-status-danger">≤ 7 hari / terlambat</span>
            <button
              v-if="canOpenMonitoring"
              type="button"
              class="cursor-pointer rounded text-label-md font-semibold text-primary transition-colors hover:text-primary-hover"
              @click="navigateTo('/admin/monitoring')">
              Pantau &rarr;
            </button>
          </div>
        </template>
      </DashboardKpiCard>

      <DashboardKpiCard label="Pasien Terdaftar" :value="patients.total" :icon="UserRound">
        <template #footer>
          <div class="flex items-center justify-between gap-2">
            <span
class="flex items-center gap-1.5 text-label-md font-bold"
              :class="patientGrowth.up ? 'text-status-success' : 'text-text-secondary'">
              <TrendingUp
v-if="patientGrowth.delta !== null && patientGrowth.up" class="size-4"
                aria-hidden="true" />
              <TrendingDown v-else-if="patientGrowth.delta !== null" class="size-4" aria-hidden="true" />
              {{ patientGrowth.delta ?? patients.thisMonth }}
            </span>
            <span class="text-caption text-text-muted">{{ patientGrowth.caption }}</span>
          </div>
        </template>
      </DashboardKpiCard>

      <DashboardKpiCard label="Tenaga Medis Aktif" :value="workers.active" :icon="Stethoscope">
        <template #footer>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-text-secondary">
            <span class="font-semibold text-primary">{{ workers.dentists }} Dokter Gigi</span>
            <span class="text-text-muted">&middot;</span>
            <span class="font-semibold text-primary">{{ workers.nurses }} Perawat Gigi</span>
          </div>
        </template>
      </DashboardKpiCard>

      <DashboardKpiCard label="Total Pemeriksaan" :value="examinations.total" :icon="ClipboardList">
        <template #footer>
          <div class="flex items-center justify-between gap-2">
            <span class="text-label-md font-bold text-primary">
              {{ examinations.last7Days > 0 ? `+${examinations.last7Days} Sesi` : 'Sesi 7 hari' }}
            </span>
            <span class="text-caption text-text-muted">
              {{ examinations.last7Days > 0 ? '7 hari terakhir' : 'belum ada 7 hari terakhir' }}
            </span>
          </div>
        </template>
      </DashboardKpiCard>

      <DashboardKpiCard
label="Perlu Tindakan Klinis" :value="examinations.clinicalActionNeeded"
        :icon="TriangleAlert" value-class="text-status-danger">
        <template #footer>
          <div class="flex items-center justify-between gap-2">
            <span class="flex items-center gap-1.5 text-caption font-semibold text-status-danger">
              <span class="size-1.5 rounded-full bg-status-danger" aria-hidden="true" />
              Kalkulus Berat / Karies
            </span>
            <button
              v-if="canOpenPatientData"
              type="button"
              class="cursor-pointer rounded text-label-md font-semibold text-primary transition-colors hover:text-primary-hover"
              @click="navigateTo('/admin/pasien')">
              Tinjau &rarr;
            </button>
          </div>
        </template>
      </DashboardKpiCard>
    </template>
  </div>
</template>
