<script setup lang="ts">
import type { AccountStatsDto } from '~~/shared/types/account'
import { Stethoscope, TrendingDown, TrendingUp } from 'lucide-vue-next'

const props = defineProps<{ stats: AccountStatsDto | null }>()

function deltaLabel(value: number) {
  if (value > 0) return `+${value} bulan ini`
  if (value < 0) return `${value} bulan ini`
  return 'stabil bulan ini'
}

const deltaIsPositive = computed(() => (props.stats?.activePatientDelta ?? 0) >= 0)
</script>

<template>
  <section class="flex flex-col gap-space-md rounded-xl bg-surface-card p-space-md shadow-sm">
    <div class="flex items-center gap-2">
      <span class="flex size-8 items-center justify-center rounded-lg bg-primary-surface text-primary">
        <Stethoscope class="size-4" aria-hidden="true" />
      </span>
      <h3 class="font-label-md text-label-md font-semibold uppercase tracking-wider text-text-secondary">
        Statistik Kasus &amp; Monitoring
      </h3>
    </div>

    <Skeleton v-if="!props.stats" class="h-28 w-full rounded-lg" />

    <template v-else>
      <dl class="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div class="rounded-lg bg-bg-canvas p-3">
          <dt class="font-caption text-caption uppercase tracking-wider text-text-muted">Pasien Aktif</dt>
          <dd class="mt-0.5 font-headline-md text-headline-md text-text-primary">
            {{ props.stats.activePatientsThisMonth }}
          </dd>
          <dd
            class="mt-0.5 flex items-center gap-1 font-caption text-caption font-semibold"
            :class="deltaIsPositive ? 'text-status-success' : 'text-status-danger'"
          >
            <TrendingUp v-if="deltaIsPositive" class="size-3.5" aria-hidden="true" />
            <TrendingDown v-else class="size-3.5" aria-hidden="true" />
            {{ deltaLabel(props.stats.activePatientDelta) }}
          </dd>
        </div>

        <div class="rounded-lg bg-bg-canvas p-3">
          <dt class="font-caption text-caption uppercase tracking-wider text-text-muted">Kalkulus Teratasi</dt>
          <dd class="mt-0.5 font-headline-md text-headline-md text-status-success">
            {{ props.stats.recentCaseCount > 0 ? `${props.stats.calculusResolvedPercent}%` : '—' }}
          </dd>
          <dd class="mt-0.5 font-caption text-caption text-text-secondary">
            indeks &le; 0,5 &middot; {{ props.stats.recentCaseCount }} kasus 90 hari
          </dd>
        </div>

        <div class="rounded-lg bg-bg-canvas p-3">
          <dt class="font-caption text-caption uppercase tracking-wider text-text-muted">OHI-S Terkontrol</dt>
          <dd class="mt-0.5 font-headline-md text-headline-md text-primary">
            {{ props.stats.recentCaseCount > 0 ? `${props.stats.ohisControlledPercent}%` : '—' }}
          </dd>
          <dd class="mt-0.5 font-caption text-caption text-text-secondary">kategori higiene "Baik"</dd>
        </div>
      </dl>

      <AccountActivitySparkline :activity="props.stats.activity" />
    </template>
  </section>
</template>
