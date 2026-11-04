<script setup lang="ts">
import type { OhisCategory } from '@prisma/client'
import { ohisAvatarClass } from '~~/shared/types/patient'
import { initialsOf } from '~/lib/format'
import {
  CalendarClock,
  Check,
  ChevronsUpDown,
  Loader2,
  Lock,
  Search,
  Stethoscope,
  X,
} from 'lucide-vue-next'

const draft = useMonitoringScheduleForm()
const {
  clinician,
  clinicianLabel,
  dirty,
  errors,
  isSearching,
  patientError,
  patientResults,
  patientTerm,
  purpose,
  scheduledDate,
  scheduledTime,
  selectedPatient,
  sendReminder,
  savedDraftAt,
} = draft

const categoryOfScore = (score: number | null): OhisCategory | 'none' => {
  if (score === null)
    return 'none'
  if (score <= 1.2)
    return 'baik'
  if (score <= 3)
    return 'sedang'
  return 'buruk'
}
</script>

<template>
  <section class="flex flex-col gap-space-sm rounded-xl bg-surface-card p-space-lg shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-2">
      <div class="flex items-center gap-2">
        <CalendarClock class="size-5 text-primary" aria-hidden="true" />
        <h2 class="font-headline-sm text-headline-sm font-semibold text-text-primary">
          Jadwalkan Pemantauan / Kontrol
        </h2>
      </div>
      <span
        v-if="dirty"
        class="rounded-full bg-status-warning-bg px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-status-warning"
      >
        Perubahan belum disimpan
      </span>
      <span
        v-else-if="savedDraftAt && selectedPatient"
        class="rounded-full bg-primary-surface px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-primary"
      >
        Draft tersimpan otomatis
      </span>
    </div>

    <div class="grid grid-cols-1 gap-space-lg lg:grid-cols-12">
      <div class="flex flex-col gap-2 lg:col-span-4">
        <Label for="monitoring-patient-search" class="font-label-md text-label-md">
          Pasien
        </Label>
        <div class="relative">
          <Search
class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true" />
          <Input
id="monitoring-patient-search" v-model="patientTerm" autocomplete="off"
            :disabled="Boolean(selectedPatient)"
            class="h-10 rounded-lg pl-9 font-body-sm disabled:bg-surface-container-low disabled:text-text-muted"
            placeholder="Ketik nama atau No. RM untuk mencari..." />
          <button
v-if="selectedPatient" type="button"
            class="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-text-muted hover:bg-surface-container-low hover:text-text-primary"
            aria-label="Ganti pasien" @click="draft.clearPatient()">
            <X class="size-4" aria-hidden="true" />
          </button>
        </div>

        <p v-if="patientError" class="font-caption text-caption text-status-danger">
          {{ patientError }}
        </p>

        <div
v-if="selectedPatient"
          class="flex items-center gap-space-sm rounded-lg border border-primary-highlight bg-primary-surface/40 p-space-sm">
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-full font-label-sm text-label-sm font-bold"
            :class="ohisAvatarClass[categoryOfScore(selectedPatient.ohisScore)]"
          >
            {{ initialsOf(selectedPatient.fullName) }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate font-body-sm text-body-sm font-semibold text-text-primary">
              {{ selectedPatient.fullName }}
            </p>
            <p class="font-caption text-caption text-text-muted">
              {{ selectedPatient.medicalRecordNo }} · OHI-S {{ selectedPatient.ohisScore?.toFixed(2) ?? '-' }}
            </p>
          </div>
          <Check class="size-4 shrink-0 text-primary" aria-hidden="true" />
        </div>

        <div
v-else-if="!patientTerm.trim()"
          class="flex items-start gap-2 rounded-lg bg-bg-canvas px-space-sm py-3 font-caption text-caption text-text-muted">
          <ChevronsUpDown class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Pilih pasien yang akan direcall. Tanggal, dokter, dan tujuan terisi otomatis dari rencana
            kontrol berjalan pasien.
          </span>
        </div>

        <div
v-else-if="isSearching"
          class="flex items-center gap-2 rounded-lg bg-bg-canvas px-space-sm py-3 font-caption text-caption text-text-muted">
          <Loader2 class="size-4 animate-spin" aria-hidden="true" />
          Mencari data pasien...
        </div>

        <div
v-else-if="patientResults.length === 0"
          class="rounded-lg bg-bg-canvas px-space-sm py-3 font-caption text-caption text-text-muted">
          Tidak ditemukan pasien dengan kata kunci "{{ patientTerm.trim() }}".
        </div>

        <ul v-else class="flex max-h-56 flex-col gap-1 overflow-y-auto rounded-lg bg-bg-canvas p-1">
          <li v-for="patient in patientResults" :key="patient.id">
            <button
type="button"
              class="flex w-full items-center gap-space-sm rounded-md px-2 py-1.5 text-left hover:bg-surface-card"
              @click="draft.selectPatient(patient)">
              <span
                class="flex size-8 shrink-0 items-center justify-center rounded-full font-caption text-caption font-bold"
                :class="ohisAvatarClass[categoryOfScore(patient.ohisScore)]"
              >
                {{ initialsOf(patient.fullName) }}
              </span>
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="truncate font-body-sm text-body-sm text-text-primary">{{ patient.fullName }}</span>
                <span class="font-caption text-caption text-text-muted">{{ patient.medicalRecordNo }}</span>
              </span>
              <span class="shrink-0 font-caption text-caption text-text-secondary">
                OHI-S {{ patient.ohisScore?.toFixed(2) ?? '-' }}
              </span>
            </button>
          </li>
        </ul>
      </div>

      <div class="flex flex-col gap-space-md lg:col-span-5">
        <div class="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <Label for="monitoring-schedule-date" class="font-label-md text-label-md">
              Tanggal Kontrol
            </Label>
            <Input id="monitoring-schedule-date" v-model="scheduledDate" type="date" class="h-10 rounded-lg" />
            <p v-if="errors.scheduledDate" class="font-caption text-caption text-status-danger">
              {{ errors.scheduledDate }}
            </p>
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="monitoring-schedule-time" class="font-label-md text-label-md">Waktu Sesi</Label>
            <Input id="monitoring-schedule-time" v-model="scheduledTime" type="time" step="300" class="h-10 rounded-lg" />
            <p v-if="errors.scheduledTime" class="font-caption text-caption text-status-danger">
              {{ errors.scheduledTime }}
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <Label for="monitoring-clinician" class="font-label-md text-label-md">Dokter Pemeriksa</Label>
          <div class="relative">
            <Stethoscope
class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary"
              aria-hidden="true" />
            <Input
id="monitoring-clinician" v-model="clinician" readonly
              class="h-10 cursor-not-allowed rounded-lg bg-surface-container-low pl-9 pr-10 font-body-sm text-text-secondary" />
            <Lock
class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
              aria-hidden="true" />
          </div>
          <p v-if="errors.clinician" class="font-caption text-caption text-status-danger">
            {{ errors.clinician }}
          </p>
          <p v-else class="font-caption text-caption text-text-muted">
            Terpatri pada akun tenaga medis yang sedang login — tidak dapat dipilih bebas.
            Sesi saat ini: {{ clinicianLabel || 'belum masuk' }}
          </p>
        </div>

        <div class="flex flex-col gap-1.5">
          <Label for="monitoring-purpose" class="font-label-md text-label-md">
            Tujuan / Tindakan yang Direncanakan
          </Label>
          <Textarea
id="monitoring-purpose" v-model="purpose" rows="3" maxlength="120"
            class="resize-none rounded-lg font-body-sm"
            placeholder="Contoh: Evaluasi kalkulus rahang bawah & scaling ulang" />
          <div class="flex items-start justify-between gap-2">
            <p v-if="errors.purpose" class="font-caption text-caption text-status-danger">
              {{ errors.purpose }}
            </p>
            <p v-else class="font-caption text-caption text-text-muted">
              Rekomendasi recall: kontrol berkala mengikuti skor OHI-S terakhir pasien.
            </p>
            <span class="shrink-0 font-caption text-caption text-text-muted">{{ purpose.length }}/120</span>
          </div>
        </div>
      </div>

      <div
        class="flex flex-col gap-space-md rounded-xl border border-border-subtle bg-bg-canvas p-space-md lg:col-span-3">
        <h3 class="font-label-md text-label-md font-bold uppercase tracking-wider text-text-primary">
          Pengingat Digital
        </h3>
        <label class="flex cursor-pointer items-start gap-2.5 rounded-lg bg-surface-card p-space-sm shadow-sm">
          <Checkbox class="mt-0.5" :model-value="sendReminder" @update:model-value="sendReminder = $event === true" />
          <span class="flex min-w-0 flex-col gap-0.5">
            <span class="font-body-sm text-body-sm font-semibold text-text-primary">
              Kirim pengingat in-app (H-1)
            </span>
            <span class="font-caption text-caption text-text-muted">
              Pengingat muncul di notifikasi aplikasi satu hari sebelum jadwal kontrol.
            </span>
          </span>
        </label>

        <div class="flex items-start gap-2 rounded-lg border border-status-info/20 bg-status-info-bg px-space-sm py-2">
          <CalendarClock class="mt-0.5 size-4 shrink-0 text-status-info" aria-hidden="true" />
          <p class="font-caption text-caption text-text-secondary">
            Jadwal baru otomatis menggantikan rencana kontrol sebelumnya pada rekam medis pasien.
          </p>
        </div>

        <div class="mt-auto flex flex-col gap-2">
          <Button
type="button" :disabled="draft.isSaving.value" class="gap-1.5 rounded-lg font-label-md text-label-md"
            @click="draft.save()">
            <CalendarClock class="size-[18px]" aria-hidden="true" />
            {{ draft.isSaving.value ? 'Menyimpan...' : 'Simpan Jadwal' }}
          </Button>
          <Button
type="button" variant="ghost" class="rounded-lg font-label-md text-label-md"
            @click="draft.resetForm()">
            Bersihkan
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>
