<script setup lang="ts">
import type { PatientDto } from '~~/shared/types/patient'
import {
  CalendarClock,
  CircleCheck,
  HeartPulse,
  Pencil,
  Smile,
  X,
} from 'lucide-vue-next'
import { calcAge, formatShortDateId, formatVisitSchedule, initialsOf } from '~/lib/format'
import {
  genderLabel,
  ohisBadgeClass,
  ohisCategoryLabel,
  ohisProgressClass,
} from '~~/shared/types/patient'
import { usePatientDetailQuery } from '~/composables/queries/usePatientQueries'

const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ patient: PatientDto | null }>()

const emits = defineEmits<{
  edit: [patient: PatientDto]
  examine: [patient: PatientDto]
}>()

const detailQuery = usePatientDetailQuery(() => (open.value ? props.patient?.id ?? null : null))
const patient = computed(() => detailQuery.data.value?.data ?? props.patient)
const visits = computed(() => detailQuery.data.value?.data.visits ?? [])

const age = computed(() => (patient.value ? calcAge(patient.value.birthDate) : null))

const subtitle = computed(() => {
  const current = patient.value
  if (!current)
    return ''
  const parts = [genderLabel[current.gender]]
  if (age.value !== null)
    parts.push(`${age.value} Tahun`)
  parts.push(`NIK: ${current.nik}`)
  return parts.join(' \u2022 ')
})

const ohisTone = computed(() => {
  const category = patient.value?.ohisCategory
  if (!category)
    return 'text-text-muted'
  return category === 'baik' ? 'text-status-success' : category === 'sedang' ? 'text-status-warning' : 'text-status-danger'
})

const ohisProgress = computed(() => {
  const score = patient.value?.ohisScore
  if (score === null || score === undefined)
    return 0
  return Math.min(Math.round((score / 6) * 100), 100)
})

const scheduleTitle = computed(() => {
  const current = patient.value
  if (!current)
    return '-'
  const schedule = formatVisitSchedule(current.nextVisitAt)
  if (schedule)
    return schedule.includes(':') ? `${schedule} WIB` : schedule
  return current.controlTitle ?? 'Belum dijadwalkan'
})

const scheduleNote = computed(() => {
  const current = patient.value
  if (!current)
    return ''
  if (current.nextVisitClinician)
    return `${current.nextVisitClinician} \u2022 Poli Gigi`
  return current.controlNote ?? 'Poli Gigi'
})

const isUrgent = computed(() => patient.value?.controlPriority === 'urgent')

const medicalFlags = computed(() => {
  const current = patient.value
  if (!current)
    return []
  const flags: string[] = []
  if (current.allergyAntibiotics)
    flags.push('Alergi antibiotik')
  if (current.hypertension)
    flags.push('Hipertensi')
  if (current.diabetes)
    flags.push('Diabetes melitus')
  return flags
})

function handleClose() {
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent v-if="patient" class="max-w-[70vw] min-w-[35vw] gap-0 overflow-hidden rounded-xl p-0"
      :show-close-button="false">
      <div
        class="flex items-center justify-between gap-space-md border-b border-border-subtle bg-bg-canvas/50 px-space-xl py-space-lg">
        <div class="flex min-w-0 items-center gap-space-md">
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-headline-sm text-headline-sm font-bold text-primary-foreground">
            {{ initialsOf(patient.fullName) }}
          </span>
          <div class="flex min-w-0 flex-col">
            <div class="flex flex-wrap items-center gap-2">
              <DialogTitle class="truncate font-headline-md text-headline-md font-bold text-text-primary">
                {{ patient.fullName }}
              </DialogTitle>
              <span
                class="rounded border border-primary-highlight bg-primary-surface px-2 py-0.5 font-label-sm text-label-sm font-semibold text-primary">
                {{ patient.medicalRecordNo }}
              </span>
            </div>
            <DialogDescription class="font-caption text-caption text-text-secondary">
              {{ subtitle }}
            </DialogDescription>
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon" class="size-8 shrink-0 rounded-lg text-text-muted"
          aria-label="Tutup detail pasien" @click="handleClose">
          <X class="size-5" aria-hidden="true" />
        </Button>
      </div>

      <div class="flex max-h-[70vh] flex-col gap-space-lg overflow-y-auto px-space-xl py-space-lg">
        <div class="grid grid-cols-1 gap-space-md md:grid-cols-3">
          <div
            class="flex flex-col justify-between gap-2 rounded-xl border border-border-subtle bg-bg-canvas p-space-md">
            <div class="flex items-center justify-between text-text-secondary">
              <span class="font-label-md text-label-md font-medium">Status OHI-S</span>
              <HeartPulse class="size-5" :class="ohisTone" aria-hidden="true" />
            </div>
            <div class="flex flex-col gap-1">
              <div class="flex items-baseline gap-2">
                <span class="font-metric-display text-metric-display font-bold" :class="ohisTone">
                  {{ patient.ohisScore ?? '-' }}
                </span>
                <span v-if="patient.ohisCategory"
                  class="rounded-full px-2 py-0.5 font-caption text-caption font-semibold"
                  :class="ohisBadgeClass[patient.ohisCategory]">
                  Kategori {{ ohisCategoryLabel[patient.ohisCategory] }}
                </span>
              </div>
              <p class="font-caption text-caption text-text-muted">
                Debris Index: {{ patient.debrisIndex ?? '-' }} | Calculus Index: {{ patient.calculusIndex ?? '-' }}
              </p>
            </div>
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
              <div class="h-full rounded-full"
                :class="patient.ohisCategory ? ohisProgressClass[patient.ohisCategory] : 'bg-border-subtle'"
                :style="{ width: `${ohisProgress}%` }" />
            </div>
          </div>

          <div
            class="flex flex-col justify-between gap-2 rounded-xl border border-border-subtle bg-bg-canvas p-space-md">
            <div class="flex items-center justify-between text-text-secondary">
              <span class="font-label-md text-label-md font-medium">Odontogram FDI</span>
              <Smile class="size-5 text-primary" aria-hidden="true" />
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-headline-md text-headline-md font-bold text-text-primary">
                {{ patient.healthyTeeth }} Gigi Sehat
              </span>
              <p class="font-caption text-caption text-text-muted">
                {{ patient.odontogramNote ?? 'Belum ada catatan odontogram.' }}
              </p>
            </div>
            <span class="font-label-sm text-label-sm font-semibold text-primary">
              Status Formula DMF-T: {{ patient.dmftScore ?? '-' }}
            </span>
          </div>

          <div
            class="flex flex-col justify-between gap-2 rounded-xl border border-border-subtle bg-bg-canvas p-space-md">
            <div class="flex items-center justify-between text-text-secondary">
              <span class="font-label-md text-label-md font-medium">Jadwal Kontrol</span>
              <CalendarClock class="size-5 text-status-info" aria-hidden="true" />
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-headline-md text-headline-md font-bold"
                :class="isUrgent ? 'text-status-danger' : 'text-primary'">
                {{ scheduleTitle }}
              </span>
              <p class="font-caption text-caption text-text-muted">{{ scheduleNote }}</p>
            </div>
            <span class="w-fit rounded px-2 py-0.5 font-label-sm text-label-sm font-medium"
              :class="isUrgent ? 'bg-status-danger-bg text-status-danger' : 'bg-primary-surface text-primary'">
              {{ isUrgent ? 'Perlu Tindakan' : 'Terkonfirmasi' }}
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-space-sm rounded-xl border border-border-subtle bg-surface-card p-space-md">
          <h3 class="flex items-center gap-2 font-headline-sm text-headline-sm font-semibold text-text-primary">
            <HeartPulse class="size-[18px] text-text-muted" aria-hidden="true" />
            Data Kontak &amp; Riwayat Kesehatan
          </h3>
          <div class="grid grid-cols-2 gap-space-md pt-1 sm:grid-cols-4">
            <div>
              <span class="block font-caption text-caption text-text-muted">No. WhatsApp</span>
              <span class="font-body-md text-body-md font-medium text-text-primary">{{ patient.phone }}</span>
            </div>
            <div>
              <span class="block font-caption text-caption text-text-muted">Email</span>
              <span class="break-all font-body-md text-body-md font-medium text-text-primary">{{ patient.email ?? '-'
                }}</span>
            </div>
            <div>
              <span class="block font-caption text-caption text-text-muted">Golongan Darah</span>
              <span class="font-body-md text-body-md font-medium text-text-primary">
                {{ patient.bloodType ? `${patient.bloodType}+` : '-' }}
              </span>
            </div>
            <div>
              <span class="block font-caption text-caption text-text-muted">Riwayat Khusus</span>
              <span class="font-body-md text-body-md font-medium text-text-secondary">
                {{ medicalFlags.length > 0 ? medicalFlags.join(', ') : 'Tidak Ada' }}
              </span>
            </div>
            <div class="sm:col-span-4">
              <span class="block font-caption text-caption text-text-muted">Alamat Tinggal</span>
              <span class="font-body-md text-body-md font-medium text-text-primary">{{ patient.address }}</span>
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-xl border border-border-subtle">
          <div class="flex items-center justify-between border-b border-border-subtle bg-bg-canvas px-space-md py-3">
            <span class="font-headline-sm text-headline-sm font-semibold text-text-primary">Riwayat Kunjungan &amp;
              Monitoring</span>
            <span class="font-caption text-caption text-text-muted">{{ visits.length }} Sesi Terakhir</span>
          </div>
          <div v-if="visits.length === 0"
            class="px-space-md py-space-lg text-center font-body-sm text-body-sm text-text-muted">
            Belum ada riwayat kunjungan tercatat.
          </div>
          <div v-else class="divide-y divide-border-subtle">
            <div v-for="(visit, index) in visits" :key="visit.id"
              class="flex items-center justify-between gap-space-sm px-3.5 py-3">
              <div class="flex min-w-0 items-center gap-space-sm">
                <span class="flex size-8 shrink-0 items-center justify-center rounded-lg"
                  :class="index === 0 ? 'bg-status-success-bg text-status-success' : 'bg-surface-container text-text-secondary'">
                  <CircleCheck v-if="index === 0" class="size-[18px]" aria-hidden="true" />
                  <Smile v-else class="size-[18px]" aria-hidden="true" />
                </span>
                <div class="flex min-w-0 flex-col">
                  <span class="truncate font-body-md text-body-md font-semibold text-text-primary">{{ visit.title
                    }}</span>
                  <span class="font-caption text-caption text-text-muted">
                    {{ formatShortDateId(visit.visitDate) }} &bull; Oleh {{ visit.clinicianName }}
                  </span>
                </div>
              </div>
              <span v-if="visit.ohisScore !== null" class="shrink-0 font-label-sm text-label-sm font-semibold"
                :class="ohisTone">
                OHI-S: {{ visit.ohisScore }}
              </span>
              <span v-else class="shrink-0 font-label-sm text-label-sm font-semibold text-text-secondary">Tindakan
                Selesai</span>
            </div>
          </div>
        </div>
      </div>

      <div
        class="flex flex-wrap items-center justify-between gap-space-sm border-t border-border-subtle bg-bg-canvas/50 px-space-xl py-space-md">
        <Button variant="outline" class="rounded-lg font-label-md text-label-md" @click="handleClose">
          Tutup
        </Button>
        <div class="flex items-center gap-2">
          <Button variant="outline" class="gap-1.5 rounded-lg font-label-md text-label-md"
            @click="patient && emits('edit', patient)">
            <Pencil class="size-[18px]" aria-hidden="true" />
            Ubah Profil
          </Button>
          <Button class="gap-1.5 rounded-lg font-label-md text-label-md" @click="patient && emits('examine', patient)">
            <Smile class="size-[18px]" aria-hidden="true" />
            Pemeriksaan Baru
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
