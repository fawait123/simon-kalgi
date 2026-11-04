<script setup lang="ts">
import type { OhisCategory } from '@prisma/client'
import type { MonitoringDetailDto } from '~~/shared/types/monitoring'
import {
  CalendarClock,
  CircleCheck,
  History,
  MessageSquareHeart,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-vue-next'
import { formatShortDateId, formatUtcLongDate, formatUtcShortDate, formatUtcTime } from '~/lib/format'
import {
  monitoringStatusBadgeClass,
  monitoringStatusDotClass,
  monitoringStatusLabel,
} from '~~/shared/types/monitoring'
import { ohisBadgeClass, ohisCategoryLabel } from '~~/shared/types/patient'

const props = defineProps<{
  detail: MonitoringDetailDto | null
  isPending?: boolean
  isError?: boolean
  isSendingReminder?: boolean
}>()

const emits = defineEmits<{
  schedule: [detail: MonitoringDetailDto]
  remind: [detail: MonitoringDetailDto]
  retry: []
}>()

function categoryOf(score: number | null): OhisCategory | null {
  if (score === null) return null
  if (score <= 1.2) return 'baik'
  if (score <= 3) return 'sedang'
  return 'buruk'
}

function badgeClassOf(score: number | null) {
  const category = categoryOf(score)
  return category
    ? ohisBadgeClass[category]
    : 'border-border-subtle bg-surface-container-low text-text-muted'
}

function labelOf(score: number | null) {
  const category = categoryOf(score)
  return category ? ohisCategoryLabel[category] : 'Belum dinilai'
}

function scoreText(score: number | null) {
  return score === null ? '-' : score.toFixed(2)
}

function reductionPercent(baseline: number | null, current: number | null) {
  if (!baseline || current === null) return null
  return Math.round(((baseline - current) / baseline) * 100)
}

const debrisReduction = computed(() =>
  reductionPercent(props.detail?.baseline.debrisIndex ?? null, props.detail?.current.debrisIndex ?? null))
const calculusReduction = computed(() =>
  reductionPercent(props.detail?.baseline.calculusIndex ?? null, props.detail?.current.calculusIndex ?? null))

const timeline = computed(() =>
  [...(props.detail?.timeline ?? [])].sort(
    (a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime(),
  ),
)

const nextVisitLabel = computed(() => {
  const value = props.detail?.scheduledVisitAt ?? null
  if (!value) return 'Belum terjadwal'
  return `${formatUtcLongDate(value)} · ${formatUtcTime(value)}`
})

const quickTiles = computed(() => {
  const detail = props.detail
  if (!detail) return []
  const baselineOhis = detail.baseline.ohisScore ?? 0
  const currentOhis = detail.current.ohisScore ?? 0
  return [
    {
      key: 'debris',
      label: 'Debris Index (DI)',
      baseline: scoreText(detail.baseline.debrisIndex),
      current: scoreText(detail.current.debrisIndex),
      reduction: debrisReduction.value,
    },
    {
      key: 'calculus',
      label: 'Calculus Index (CI)',
      baseline: scoreText(detail.baseline.calculusIndex),
      current: scoreText(detail.current.calculusIndex),
      reduction: calculusReduction.value,
    },
    {
      key: 'ohis',
      label: 'OHI-S Total',
      baseline: scoreText(baselineOhis || null),
      current: scoreText(currentOhis || null),
      reduction: reductionPercent(baselineOhis || null, currentOhis || null),
    },
  ]
})
</script>

<template>
  <section class="flex flex-col gap-space-md rounded-xl bg-surface-card p-space-lg shadow-sm">
    <template v-if="isPending">
      <Skeleton class="h-6 w-64" />
      <Skeleton class="h-4 w-40" />
      <div class="grid gap-space-md lg:grid-cols-12">
        <Skeleton class="h-48 rounded-xl lg:col-span-7" />
        <Skeleton class="h-48 rounded-xl lg:col-span-5" />
      </div>
    </template>

    <div v-else-if="isError" class="flex flex-col items-center gap-space-md py-space-xl text-center">
      <span class="flex size-12 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger">
        <ShieldAlert class="size-6" aria-hidden="true" />
      </span>
      <div class="flex flex-col gap-1">
        <span class="font-headline-sm text-headline-sm text-text-primary">Riwayat monitoring gagal dimuat</span>
        <p class="max-w-md font-body-md text-body-md text-text-secondary">
          Data pasien belum terdaftar pada program pemantauan aktif, atau koneksi basis data terputus.
        </p>
      </div>
      <Button type="button" variant="outline" class="gap-2 rounded-lg" @click="emits('retry')">
        <RotateCcw class="size-4" aria-hidden="true" />
        Muat Ulang
      </Button>
    </div>

    <div v-else-if="!detail" class="flex flex-col items-center gap-space-md py-space-xl text-center">
      <span class="flex size-12 items-center justify-center rounded-xl bg-surface-container-low text-text-muted">
        <History class="size-6" aria-hidden="true" />
      </span>
      <div class="flex flex-col gap-1">
        <span class="font-headline-sm text-headline-sm text-text-primary">Belum ada pasien yang dipilih</span>
        <p class="max-w-md font-body-md text-body-md text-text-secondary">
          Pilih salah satu baris pada tabel monitoring untuk melihat timeline perkembangan OHI-S, catatan evaluasi
          dokter, dan rencana kontrol berikutnya.
        </p>
      </div>
    </div>

    <template v-else>
      <div class="flex flex-wrap items-start justify-between gap-space-md">
        <div class="flex min-w-0 flex-col gap-1.5">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="font-headline-md text-headline-md font-bold text-text-primary">{{ detail.fullName }}</h2>
            <span
              class="rounded border border-border-subtle bg-bg-canvas px-2 py-0.5 font-label-sm text-label-sm font-mono text-text-secondary"
            >
              {{ detail.medicalRecordNo }}
            </span>
            <span
              class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-label-sm text-label-sm font-semibold"
              :class="monitoringStatusBadgeClass[detail.status]"
            >
              <span class="size-1.5 rounded-full" :class="monitoringStatusDotClass[detail.status]" aria-hidden="true" />
              {{ monitoringStatusLabel[detail.status] }}
            </span>
          </div>
          <p class="font-body-sm text-body-sm text-text-secondary">
            {{ detail.programName }}
            <span v-if="detail.dpjp"> · DPJP: {{ detail.dpjp }}</span>
            <span v-if="detail.current.ohisCategory">
              · Kategori terakhir: {{ ohisCategoryLabel[detail.current.ohisCategory] }}
            </span>
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-space-sm">
          <Button
            type="button"
            variant="outline"
            class="gap-2 rounded-lg font-label-md text-label-md"
            :disabled="!detail.scheduledVisitAt || isSendingReminder"
            @click="emits('remind', detail)"
          >
            <MessageSquareHeart class="size-[18px]" aria-hidden="true" />
            {{ isSendingReminder ? 'Mengirim...' : 'Kirim Pengingat In-app' }}
          </Button>
          <Button type="button" class="gap-2 rounded-lg font-label-md text-label-md" @click="emits('schedule', detail)">
            <CalendarClock class="size-[18px]" aria-hidden="true" />
            Ubah Rencana Kontrol
          </Button>
        </div>
      </div>

      <Separator class="bg-border-subtle" />

      <div class="grid grid-cols-1 gap-space-lg lg:grid-cols-12">
        <div class="flex flex-col gap-space-md lg:col-span-7">
          <div class="flex items-center gap-2">
            <History class="size-[18px] text-primary" aria-hidden="true" />
            <h3 class="font-label-md text-label-md font-bold uppercase tracking-wider text-text-primary">
              Timeline Progres Kesehatan Gigi &amp; Mulut
            </h3>
          </div>

          <ol class="flex flex-col">
            <li
              v-for="(item, index) in timeline"
              :key="item.id"
              class="relative flex gap-space-md pb-space-lg last:pb-0"
            >
              <div class="flex flex-col items-center">
                <span
                  class="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-surface-card"
                  :class="index === 0 ? 'bg-primary text-primary-foreground' : 'bg-surface-container text-text-secondary'"
                >
                  <CircleCheck v-if="index === 0" class="size-4" aria-hidden="true" />
                  <span v-else class="size-2 rounded-full bg-current" aria-hidden="true" />
                </span>
                <span v-if="index < timeline.length - 1" class="w-0.5 flex-1 bg-border-subtle" aria-hidden="true" />
              </div>

              <div class="flex min-w-0 flex-1 flex-col gap-1 rounded-lg bg-bg-canvas p-space-md">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="font-body-sm text-body-sm font-semibold text-text-primary">{{ item.title }}</span>
                  <span class="font-caption text-caption text-text-muted">{{ formatUtcShortDate(item.visitDate) }}</span>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-label-sm text-label-sm font-semibold"
                    :class="badgeClassOf(item.ohisScore)"
                  >
                    OHI-S {{ scoreText(item.ohisScore) }} · {{ labelOf(item.ohisScore) }}
                  </span>
                  <span class="font-caption text-caption text-text-secondary">{{ item.clinicianName }}</span>
                </div>
                <p v-if="item.note" class="font-caption text-caption text-text-secondary">
                  {{ item.note }}
                </p>
              </div>
            </li>
            <li v-if="timeline.length === 0" class="rounded-lg bg-bg-canvas p-space-md font-caption text-caption text-text-muted">
              Belum ada riwayat kunjungan yang terekam untuk pasien ini.
            </li>
          </ol>
        </div>

        <div class="flex flex-col gap-space-md lg:col-span-5">
          <div class="flex flex-col gap-space-sm rounded-xl border border-primary-highlight bg-primary-surface/40 p-space-md">
            <div class="flex items-center gap-2">
              <ShieldCheck class="size-[18px] text-primary" aria-hidden="true" />
              <h3 class="font-label-md text-label-md font-bold uppercase tracking-wider text-primary">
                Catatan Evaluasi Dokter
              </h3>
            </div>
            <blockquote class="font-body-sm text-body-sm italic text-text-secondary">
              “{{ detail.doctorNote ?? 'Belum ada catatan evaluasi dokter untuk program pemantauan ini.' }}”
            </blockquote>
            <p class="font-caption text-caption text-text-muted">
              <span class="font-semibold text-text-secondary">Divalidasi oleh:</span>
              {{ detail.validatedByClinician ?? 'Menunggu validasi dokter pemeriksa' }}
            </p>
          </div>

          <div class="flex flex-col gap-space-sm">
            <div
              v-for="tile in quickTiles"
              :key="tile.key"
              class="flex items-center justify-between gap-space-sm rounded-lg bg-bg-canvas px-space-md py-space-sm"
            >
              <span class="flex flex-col">
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">{{ tile.label }}</span>
                <span class="font-caption text-caption text-text-secondary">
                  Awal {{ tile.baseline }} → terkini {{ tile.current }}
                </span>
              </span>
              <span
                class="rounded-md px-2 py-1 font-label-sm text-label-sm font-semibold"
                :class="tile.reduction !== null && tile.reduction > 0
                  ? 'bg-status-success-bg text-status-success'
                  : 'bg-surface-container-low text-text-muted'"
              >
                {{ tile.reduction !== null && tile.reduction > 0 ? `-${tile.reduction}%` : 'stabil' }}
              </span>
            </div>
          </div>

          <div class="flex flex-col gap-space-sm rounded-xl border border-border-subtle p-space-md">
            <h3 class="font-label-md text-label-md font-bold uppercase tracking-wider text-text-primary">
              Rencana Kontrol Berikutnya
            </h3>
            <p class="font-body-md text-body-md font-semibold text-text-primary">
              {{ nextVisitLabel ?? 'Belum terjadwal' }}
            </p>
            <p v-if="detail.scheduledVisitNote" class="font-caption text-caption text-text-secondary">
              {{ detail.scheduledVisitNote }}
            </p>
            <p class="font-caption text-caption text-text-muted">
              <span class="font-semibold text-status-success">●</span>
              Pengingat in-app:
              {{ detail.reminderConfirmed ? 'aktif (H-1)' : 'belum diaktifkan' }}
            </p>
            <p v-if="detail.reminderSentAt" class="font-caption text-caption text-text-muted">
              Pengingat terakhir terkirim {{ formatShortDateId(detail.reminderSentAt) }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
