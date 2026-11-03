<script setup lang="ts">
import { BadgeCheck, CalendarDays, ClipboardList, HeartPulse, ShieldAlert, Stethoscope } from 'lucide-vue-next'
import { heartRhythmLabel } from '~~/shared/types/examination'

const draft = useExaminationForm()
const {
  patient,
  examDate,
  examinerLabel,
  chiefComplaint,
  bloodPressure,
  heartRate,
  heartRhythm,
} = draft

function setRhythm(value: unknown) {
  heartRhythm.value = value === 'tidak_reguler' ? 'tidak_reguler' : 'reguler'
}
</script>

<template>
  <section class="flex flex-col gap-space-md rounded-xl bg-surface-card p-space-lg shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-2 pb-space-xs">
      <div class="flex items-center gap-2">
        <Stethoscope class="size-5 text-primary" aria-hidden="true" />
        <h2 class="font-headline-sm text-headline-sm font-semibold text-text-primary">
          1. Informasi Pasien &amp; Kunjungan
        </h2>
      </div>
      <span
        v-if="patient"
        class="inline-flex items-center gap-1 rounded-full bg-status-info-bg px-2.5 py-0.5 font-label-sm text-label-sm text-status-info"
      >
        <BadgeCheck class="size-[14px]" aria-hidden="true" />
        Rekam Medis Aktif
      </span>
    </div>

    <div class="grid grid-cols-1 gap-space-md md:grid-cols-2 lg:grid-cols-4">
      <div class="flex flex-col gap-1.5 lg:col-span-2">
        <Label for="examination-patient" class="font-label-md text-label-md text-text-primary">
          Pilih Pasien Terdaftar
        </Label>
        <ExaminationPatientPicker />
        <p v-if="patient" class="flex flex-wrap items-center gap-2 pt-0.5 font-caption text-caption text-text-secondary">
          <span>NIK: {{ patient.nik }}</span>
          <span aria-hidden="true">•</span>
          <span>No. Telepon: {{ patient.phone }}</span>
          <span aria-hidden="true">•</span>
          <span>Gol. Darah: {{ patient.bloodType ?? '-' }}</span>
        </p>
        <p v-else class="pt-0.5 font-caption text-caption text-text-muted">
          Data alergi, NIK, dan kontak pasien akan dimuat otomatis setelah pasien dipilih.
        </p>
      </div>

      <div class="flex flex-col gap-1.5">
        <Label for="examination-date" class="font-label-md text-label-md text-text-primary">
          Tanggal Pemeriksaan
        </Label>
        <div class="relative flex items-center">
          <CalendarDays
            class="pointer-events-none absolute left-2.5 size-[18px] text-text-muted"
            aria-hidden="true"
          />
          <Input
            id="examination-date"
            v-model="examDate"
            type="date"
            class="h-10 rounded-lg bg-bg-canvas pl-9 font-body-md"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <Label for="examination-examiner" class="font-label-md text-label-md text-text-primary">
          Dokter Pemeriksa
        </Label>
        <div class="relative flex items-center">
          <BadgeCheck
            class="pointer-events-none absolute left-2.5 size-[18px] text-primary"
            aria-hidden="true"
          />
          <Input
            id="examination-examiner"
            :model-value="examinerLabel"
            readonly
            placeholder="Memuat akun..."
            class="h-10 rounded-lg bg-surface-container-low pl-9 font-body-sm"
          />
        </div>
        <p class="font-caption text-caption text-text-muted">
          Tercatat otomatis sesuai akun yang sedang masuk dan tidak dapat diubah.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-space-md pt-space-xs lg:grid-cols-3">
      <div class="flex flex-col gap-1.5 lg:col-span-2">
        <Label for="examination-complaint" class="font-label-md text-label-md text-text-primary">
          Keluhan Utama (Anamnesis)
        </Label>
        <Textarea
          id="examination-complaint"
          v-model="chiefComplaint"
          rows="3"
          class="resize-none rounded-lg bg-bg-canvas font-body-md focus:bg-surface-container-low"
          placeholder="Deskripsi keluhan pasien, durasi, dan lokasi regio..."
        />
      </div>

      <div class="flex flex-col gap-2.5">
        <div class="flex flex-col gap-1">
          <span class="font-label-md text-label-md text-text-primary">Tanda Vital</span>
          <div class="grid grid-cols-2 gap-2">
            <div class="flex flex-col gap-1">
              <Label for="examination-bp" class="font-caption text-caption text-text-muted">
                Tekanan Darah (mmHg)
              </Label>
              <Input
                id="examination-bp"
                v-model="bloodPressure"
                autocomplete="off"
                class="h-9 rounded-lg bg-bg-canvas font-body-sm"
                placeholder="120/80"
              />
            </div>
            <div class="flex flex-col gap-1">
              <Label for="examination-hr" class="font-caption text-caption text-text-muted">
                Detak Jantung (bpm)
              </Label>
              <Input
                id="examination-hr"
                v-model="heartRate"
                inputmode="numeric"
                autocomplete="off"
                class="h-9 rounded-lg bg-bg-canvas font-body-sm"
                placeholder="76"
              />
            </div>
          </div>
          <div class="flex items-center gap-1.5 pt-1 font-caption text-caption text-text-secondary">
            <HeartPulse class="size-4 text-primary" aria-hidden="true" />
            <span>Irama:</span>
            <span class="font-medium text-text-primary">{{ heartRhythmLabel[heartRhythm] }}</span>
            <Select :model-value="heartRhythm" @update:model-value="setRhythm">
              <SelectTrigger
                class="ml-auto h-7 w-[9.5rem] rounded-md border-border-subtle bg-bg-canvas px-2 font-caption text-caption"
                aria-label="Irama jantung"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reguler">
                  Reguler
                </SelectItem>
                <SelectItem value="tidak_reguler">
                  Tidak Reguler
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div
          v-if="patient"
          class="flex items-start gap-2 rounded-lg p-2"
          :class="patient.allergyAntibiotics
            ? 'bg-status-danger-bg text-status-danger'
            : 'bg-status-success-bg text-status-success'"
        >
          <ShieldAlert v-if="patient.allergyAntibiotics" class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <BadgeCheck v-else class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div class="flex flex-col gap-1">
            <span class="font-caption text-caption font-medium">
              Alergi Obat:
              {{ patient.allergyAntibiotics ? 'Ada riwayat alergi antibiotik' : 'Tidak ada riwayat alergi' }}
            </span>
            <span
              v-if="patient.hypertension || patient.diabetes"
              class="flex flex-wrap items-center gap-1.5 font-caption text-caption"
            >
              <span
                v-if="patient.hypertension"
                class="rounded bg-surface-card px-1.5 py-0.5 font-label-sm text-label-sm"
              >
                Hipertensi terdata
              </span>
              <span
                v-if="patient.diabetes"
                class="rounded bg-surface-card px-1.5 py-0.5 font-label-sm text-label-sm"
              >
                Diabetes terdata
              </span>
            </span>
          </div>
        </div>
        <div v-else class="flex items-center gap-2 rounded-lg bg-bg-canvas p-2 text-text-muted">
          <ClipboardList class="size-4 shrink-0" aria-hidden="true" />
          <span class="font-caption text-caption">Riwayat alergi muncul setelah pasien dipilih.</span>
        </div>
      </div>
    </div>
  </section>
</template>
