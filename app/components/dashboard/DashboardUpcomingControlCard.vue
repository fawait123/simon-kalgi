<script setup lang="ts">
import type { MonitoringHintTone, MonitoringRowDto } from '~~/shared/types/monitoring'
import {
  CalendarClock,
  CircleAlert,
  Info,
  MailWarning,
  RotateCcw,
  Send,
  ShieldCheck,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { formatUtcShortDate, formatUtcTime } from '~/lib/format'
import { useConfirmReminderMutation } from '~/composables/queries/useDashboardQueries'
import { useSendReminderMutation } from '~/composables/queries/useMonitoringQueries'
import { genderLabel, ohisAvatarClass } from '~~/shared/types/patient'

defineProps<{
  rows: MonitoringRowDto[]
  isPending?: boolean
  isError?: boolean
  errorText?: string
}>()

const emits = defineEmits<{ retry: [] }>()

const reminderMutation = useSendReminderMutation()
const confirmMutation = useConfirmReminderMutation()

const toneStyle: Record<MonitoringHintTone, { textClass: string, icon: typeof Info }> = {
  success: { textClass: 'text-status-success', icon: ShieldCheck },
  info: { textClass: 'text-status-info', icon: Send },
  muted: { textClass: 'text-text-muted', icon: CircleAlert },
  danger: { textClass: 'text-status-danger', icon: MailWarning },
}

/** `reminder_confirmed` di skema ini berarti pengingat in-app H-1 aktif, bukan kehadiran pasien. */
function reminderState(row: MonitoringRowDto) {
  if (row.reminderSentAt)
    return { label: 'Pengingat Terkirim (in-app)', tone: 'info' as MonitoringHintTone }
  if (row.reminderConfirmed)
    return { label: 'Pengingat Aktif (H-1)', tone: 'success' as MonitoringHintTone }
  return { label: 'Pengingat Belum Aktif', tone: 'muted' as MonitoringHintTone }
}

function scheduleText(row: MonitoringRowDto) {
  if (!row.scheduledVisitAt)
    return row.scheduleHint?.text ?? 'Belum terjadwal'
  const hint = row.scheduleHint?.text ?? formatUtcShortDate(row.scheduledVisitAt)
  return `${hint}, ${formatUtcTime(row.scheduledVisitAt)}`
}

function ageText(row: MonitoringRowDto) {
  return `${genderLabel[row.gender]}, ${row.age} th`
}

function isSending(row: MonitoringRowDto) {
  return reminderMutation.isPending.value && reminderMutation.variables.value === row.patientId
}

function isConfirming(row: MonitoringRowDto) {
  return confirmMutation.isPending.value && confirmMutation.variables.value === row.patientId
}

function remind(row: MonitoringRowDto) {
  if (!row.scheduledVisitAt) {
    toast.warning('Pasien ini belum memiliki jadwal kontrol aktif.', {
      description: `${row.fullName} — jadwalkan sesi terlebih dahulu di halaman Monitoring.`,
    })
    return
  }
  reminderMutation.mutate(row.patientId)
}

function enableReminder(row: MonitoringRowDto) {
  confirmMutation.mutate(row.patientId)
}
</script>

<template>
  <div
    class="flex h-full flex-col rounded-xl bg-surface-card p-space-md shadow-sm lg:col-span-4 xl:col-span-4">
    <div class="flex items-start justify-between gap-2">
      <div>
        <h2 class="text-headline-sm text-text-primary">Jadwal Kontrol Terdekat</h2>
        <p class="text-caption text-text-muted">Evaluasi scaling &amp; profilaksis minggu ini</p>
      </div>
      <span
        class="flex size-9 items-center justify-center rounded-lg bg-primary-surface text-primary">
        <CalendarClock class="size-5" aria-hidden="true" />
      </span>
    </div>

    <div v-if="isError" class="mt-space-md flex flex-col items-center gap-space-md rounded-lg bg-bg-canvas p-space-lg text-center">
      <CircleAlert class="size-6 text-status-danger" aria-hidden="true" />
      <p class="text-body-md text-text-secondary">
        {{ errorText ?? 'Jadwal kontrol gagal dimuat.' }}
      </p>
      <Button type="button" variant="outline" size="sm" class="gap-2 rounded-lg" @click="emits('retry')">
        <RotateCcw class="size-4" aria-hidden="true" />
        Coba lagi
      </Button>
    </div>

    <div v-else-if="isPending" class="mt-space-md flex flex-col gap-2">
      <Skeleton v-for="index in 3" :key="`control-${index}`" class="h-[92px] w-full rounded-lg" />
    </div>

    <div v-else-if="!rows.length" class="mt-space-md flex flex-col items-center gap-2 rounded-lg bg-bg-canvas p-space-lg text-center">
      <CalendarClock class="size-6 text-text-muted" aria-hidden="true" />
      <p class="text-body-md text-text-secondary">
        Tidak ada jadwal kontrol dalam tujuh hari ke depan.
      </p>
    </div>

    <template v-else>
      <ul class="mt-space-md flex flex-col gap-2">
        <li
v-for="row in rows" :key="row.patientId"
          class="flex flex-col gap-2 rounded-lg border border-border-subtle bg-bg-canvas p-3">
          <div class="flex items-start gap-2.5">
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-lg text-label-md font-bold"
              :class="ohisAvatarClass[row.ohisCategory ?? 'none']">
              {{ row.initials }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-label-md font-semibold text-text-primary">{{ row.fullName }}</p>
              <p class="text-caption text-text-muted">{{ ageText(row) }}</p>
              <p class="mt-0.5 truncate text-caption text-text-secondary">{{ row.programName }}</p>
            </div>
            <span class="shrink-0 text-right text-caption font-semibold text-primary">
              {{ scheduleText(row) }}
            </span>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2">
            <span
class="flex items-center gap-1.5 text-caption font-semibold"
              :class="toneStyle[reminderState(row).tone].textClass">
              <component
:is="toneStyle[reminderState(row).tone].icon" class="size-3.5"
                aria-hidden="true" />
              {{ reminderState(row).label }}
            </span>

            <div class="flex flex-wrap items-center gap-1.5">
              <Button
type="button" variant="outline" size="xs" class="gap-1.5 rounded-lg text-text-secondary"
                :disabled="!row.scheduledVisitAt || isSending(row)" :aria-label="`Kirim pengingat untuk ${row.fullName}`"
                @click="remind(row)">
                <Send class="size-3.5" aria-hidden="true" />
                {{ isSending(row) ? 'Mengirim...' : 'Kirim Notif' }}
              </Button>
              <Button
                type="button" variant="outline" size="xs" class="gap-1.5 rounded-lg text-text-secondary"
                :disabled="row.reminderConfirmed || isConfirming(row)"
                :aria-label="`Aktifkan pengingat in-app untuk ${row.fullName}`" @click="enableReminder(row)">
                <ShieldCheck class="size-3.5" aria-hidden="true" />
                {{ isConfirming(row) ? 'Menyimpan...' : 'Aktifkan Pengingat' }}
              </Button>
              <Button
type="button" variant="ghost" size="xs"
                class="gap-1.5 rounded-lg text-text-secondary" :aria-label="`Ubah jadwal kontrol ${row.fullName}`"
                @click="navigateTo('/admin/monitoring')">
                Reschedule
              </Button>
            </div>
          </div>
        </li>
      </ul>

      <div class="mt-space-md flex items-start gap-2 rounded-lg bg-primary-surface p-3">
        <Info class="mt-0.5 size-[18px] shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p class="text-label-md font-bold text-primary">Demonstrasi Standar OHI-S</p>
          <p class="mt-1 text-caption leading-relaxed text-text-secondary">
            Perhitungan kalkulus otomatis mengacu pada rumus Green &amp; Vermillion (DI-S + CI-S).
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
