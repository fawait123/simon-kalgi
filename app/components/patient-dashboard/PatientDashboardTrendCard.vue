<script setup lang="ts">
import type { OhisCategory } from '@prisma/client'
import type { PatientExamSessionDto } from '~~/shared/types/patient-record'
import { ohisCategoryLabel } from '~~/shared/types/patient'
import { OHIS_TARGET_MAX } from '~~/shared/types/care'
import { formatShortDateId } from '~/lib/format'
import { Info, TrendingUp } from 'lucide-vue-next'

interface TrendNode {
  key: string
  visitLabel: string
  dateLabel: string
  scoreText: string
  note: string
  chipClass: string
  dotFill: string
  score: number
  isCurrent?: boolean
}

const props = defineProps<{
  /** Sesi urut turun seperti DTO server (terbaru di depan). */
  sessions: PatientExamSessionDto[]
  targetDate: string | null
}>()

const chipClassByCategory: Record<OhisCategory, string> = {
  baik: 'bg-status-success-bg text-status-success',
  sedang: 'bg-status-warning-bg text-status-warning',
  buruk: 'bg-status-danger-bg text-status-danger',
}

const fillByCategory: Record<OhisCategory, string> = {
  baik: 'fill-status-success',
  sedang: 'fill-status-warning',
  buruk: 'fill-status-danger',
}

const ascending = computed(() => [...props.sessions].reverse())

const nodes = computed<TrendNode[]>(() => {
  const visits = ascending.value
  const list: TrendNode[] = visits.map((session, index) => ({
    key: session.id,
    visitLabel: `Kunjungan ${index + 1}${visits.length > 1 && index === visits.length - 1 ? ' (Terbaru)' : index === 0 ? ' (Awal)' : ''}`,
    dateLabel: formatShortDateId(session.examDate),
    scoreText: session.ohisScore.toFixed(2),
    note: ohisCategoryLabel[session.ohisCategory],
    chipClass: chipClassByCategory[session.ohisCategory],
    dotFill: fillByCategory[session.ohisCategory],
    score: session.ohisScore,
    isCurrent: visits.length > 1 && index === visits.length - 1,
  }))

  if (visits.length > 1) {
    const first = visits[0]
    const last = visits[visits.length - 1]
    const latest = list[list.length - 1]
    if (first && last && latest) {
      const delta = last.ohisScore - first.ohisScore
      latest.note = delta <= 0
        ? `Turun ${delta.toFixed(2)} poin sejak awal`
        : `Naik +${delta.toFixed(2)} poin sejak awal`
    }
  }

  if (props.targetDate) {
    list.push({
      key: 'target',
      visitLabel: 'Kunjungan Berikutnya (Target)',
      dateLabel: formatShortDateId(props.targetDate),
      scoreText: `< ${OHIS_TARGET_MAX.toFixed(2)}`,
      note: 'Target Bersih Radang',
      chipClass: 'bg-status-success-bg text-status-success',
      dotFill: 'fill-status-success',
      score: OHIS_TARGET_MAX,
    })
  }
  return list
})

/** Poin makin rendah = skor membaik, jadi garis tren menurun visual sesuai desain. */
function pointOf(index: number, total: number, score: number) {
  return {
    cx: 300 * ((index + 0.5) / total),
    cy: 8 + ((6 - Math.min(6, score)) / 6) * 34,
  }
}

const points = computed(() => {
  const list = nodes.value
  if (list.length < 2) return ''
  return list.map((node, index) => {
    const { cx, cy } = pointOf(index, list.length, node.score)
    return `${cx},${cy}`
  }).join(' ')
})

const nodePositions = computed(() => {
  const list = nodes.value
  if (list.length < 2) return []
  return list.map((node, index) => ({
    key: node.key,
    ...pointOf(index, list.length, node.score),
    fill: node.dotFill,
    isCurrent: node.isCurrent,
  }))
})
</script>

<template>
  <section class="flex flex-col rounded-xl border border-border-subtle bg-surface-card p-space-xl shadow-sm">
    <div class="mb-space-lg flex flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-start gap-space-sm">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-surface text-primary">
          <TrendingUp class="size-5" aria-hidden="true" />
        </span>
        <div>
          <span class="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">
            Grafik Perjalanan Klinis
          </span>
          <h2 class="font-headline-md text-headline-md text-text-primary">
            Tren Indeks Kebersihan Mulut (OHI-S)
          </h2>
        </div>
      </div>
      <div class="flex items-center gap-space-md font-caption text-caption text-text-secondary">
        <span class="flex items-center gap-1.5">
          <span class="size-3 rounded-full bg-primary-container" aria-hidden="true" /> Skor Pemeriksaan
        </span>
        <span class="flex items-center gap-1.5">
          <span class="size-3 rounded-full bg-status-success" aria-hidden="true" /> Target Optimal (&lt;{{ OHIS_TARGET_MAX.toFixed(2) }})
        </span>
      </div>
    </div>

    <div v-if="nodes.length === 0" class="rounded-lg bg-bg-canvas p-space-lg text-center">
      <p class="font-body-md text-body-md text-text-secondary">
        Tren OHI-S akan muncul setelah dokter memfinalisasi pemeriksaan pertama Anda.
      </p>
    </div>

    <template v-else>
      <div class="mb-space-md rounded-xl bg-bg-canvas p-space-md">
        <div class="gap-2 pb-2 text-center" :style="{ display: 'grid', gridTemplateColumns: `repeat(${nodes.length}, minmax(0, 1fr))` }">
          <div v-for="node in nodes" :key="node.key" class="relative flex flex-col items-center">
            <span
              v-if="node.isCurrent"
              class="absolute -top-3 z-10 rounded-full bg-primary-surface px-2 py-0.5 font-label-sm text-label-sm font-semibold text-primary"
            >
              Saat Ini
            </span>
            <span class="font-caption text-caption text-text-muted">{{ node.visitLabel }}</span>
            <span class="font-label-sm text-label-sm text-text-secondary">{{ node.dateLabel }}</span>
            <span
              class="my-2 rounded-md px-3 py-1 font-headline-sm text-headline-sm"
              :class="node.chipClass"
            >
              {{ node.scoreText }}
            </span>
            <span class="font-caption text-caption text-text-secondary">{{ node.note }}</span>
          </div>
        </div>

        <svg
          v-if="points"
          class="mt-2 h-12 w-full overflow-visible px-8"
          viewBox="0 0 300 50"
          preserveAspectRatio="none"
          role="img"
          aria-label="Garis tren skor OHI-S antar kunjungan"
        >
          <line x1="0" x2="300" y1="41" y2="41" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4 4" />
          <polyline
            :points="points"
            fill="none"
            stroke="currentColor"
            class="text-primary-container"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle
            v-for="node in nodePositions"
            :key="node.key"
            :cx="node.cx"
            :cy="node.cy"
            :r="node.isCurrent ? 6 : 5"
            :class="[node.fill, node.isCurrent ? 'stroke-surface-card' : '']"
            :stroke-width="node.isCurrent ? 2 : 0"
          />
        </svg>
      </div>

      <div class="flex items-start gap-space-sm rounded-lg bg-surface-container-low p-space-md">
        <Info class="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div class="flex flex-col gap-1">
          <h4 class="font-label-md text-label-md font-semibold text-text-primary">
            Apa arti skor OHI-S bagi kesehatan gigi Anda?
          </h4>
          <p class="font-caption text-caption leading-relaxed text-text-secondary">
            OHI-S (Oral Hygiene Index Simplified) mengukur endapan plak dan karang gigi. Rentang
            <strong>0 – 1.2</strong> tergolong Baik, <strong>1.3 – 3.0</strong> memerlukan perhatian
            pembersihan rutin di rumah, dan <strong>&gt; 3.0</strong> membutuhkan tindakan pembersihan medis segera.
          </p>
        </div>
      </div>
    </template>
  </section>
</template>
