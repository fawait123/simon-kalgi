<script setup lang="ts">
import type { HealthWorkerDto } from '~~/shared/types/health-worker'
import {
  BadgeCheck,
  CalendarDays,
  CircleCheck,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-vue-next'
import { formatDateId, initialsOf } from '~/lib/format'
import {
  accessLevelLabel,
  employmentStatusLabel,
  roleLabel,
  statusLabel,
} from '~~/shared/types/health-worker'

const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ worker: HealthWorkerDto | null }>()

const worker = computed(() => props.worker)

const genderLabel = computed(() => (worker.value?.gender === 'L' ? 'Laki-laki' : 'Perempuan'))

const infoFields = computed(() => {
  const current = worker.value
  if (!current)
    return []
  return [
    {
      label: 'Nomor STR / SIP',
      value: current.strNumber,
      hint: `Berlaku hingga ${formatDateId(current.strExpiryDate)}`,
      icon: ShieldCheck,
    },
    {
      label: 'NIK',
      value: current.nik,
      hint: `Tanggal lahir ${formatDateId(current.birthDate)}, ${genderLabel.value}`,
      icon: BadgeCheck,
    },
    {
      label: 'Telepon',
      value: current.phone,
      hint: 'Kontak aktif',
      icon: Phone,
    },
    {
      label: 'Email',
      value: current.email,
      hint: 'Akun notifikasi sistem',
      icon: Mail,
    },
  ]
})

const statusTone = computed(() => {
  if (worker.value?.status === 'aktif')
    return 'bg-status-success-bg text-status-success'
  if (worker.value?.status === 'cuti')
    return 'bg-status-warning-bg text-status-warning'
  return 'bg-status-danger-bg text-status-danger'
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent v-if="worker" class="max-w-[70vw] min-w-[35vw] gap-0 overflow-hidden rounded-xl p-0">
      <div class="flex items-start gap-space-md bg-primary-surface px-space-xl py-space-lg">
        <Avatar class="size-14 shrink-0">
          <AvatarImage v-if="worker.avatarUrl" :src="worker.avatarUrl" :alt="worker.fullName" />
          <AvatarFallback class="bg-primary font-body-lg text-primary-foreground">
            {{ initialsOf(worker.fullName) }}
          </AvatarFallback>
        </Avatar>
        <div class="flex min-w-0 flex-col gap-1">
          <span class="w-fit rounded bg-primary px-2 py-0.5 font-label-sm text-label-sm text-primary-foreground">
            {{ roleLabel[worker.role] }}
          </span>
          <DialogTitle class="flex items-center gap-1.5 font-headline-md text-headline-md text-text-primary">
            <span class="truncate">{{ worker.fullName }}</span>
            <BadgeCheck v-if="worker.isPic" class="size-4 shrink-0 text-primary" aria-label="Penanggung jawab modul" />
          </DialogTitle>
          <DialogDescription class="font-body-md text-body-md text-text-secondary">
            {{ worker.specialization ?? roleLabel[worker.role] }} &middot; ID Medis {{ worker.medicalId }}
          </DialogDescription>
        </div>
      </div>

      <div class="flex flex-col gap-space-lg px-space-xl py-space-lg">
        <div class="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
          <div v-for="field in infoFields" :key="field.label" class="rounded-lg bg-bg-canvas p-space-md">
            <span class="flex items-center gap-2 font-caption text-caption uppercase tracking-wider text-text-muted">
              <component :is="field.icon" class="size-3.5" aria-hidden="true" />
              {{ field.label }}
            </span>
            <p class="mt-1 font-body-lg break-all text-text-primary">
              {{ field.value }}
            </p>
            <p class="font-caption text-caption text-text-muted">
              {{ field.hint }}
            </p>
          </div>
        </div>

        <div class="rounded-lg border border-border-subtle p-space-md">
          <span class="flex items-center gap-2 font-caption text-caption uppercase tracking-wider text-text-muted">
            <CalendarDays class="size-3.5" aria-hidden="true" />
            Hari &amp; Jadwal Jaga
          </span>
          <div class="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p class="font-body-lg text-text-primary">{{ worker.dutyDays }}</p>
            <p class="flex items-center gap-1.5 font-body-sm text-text-secondary">
              <Clock class="size-4 text-text-muted" aria-hidden="true" />
              {{ worker.dutyTime }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
          <div class="rounded-lg bg-bg-canvas p-space-md">
            <span class="font-caption text-caption uppercase tracking-wider text-text-muted">Status Kepegawaian</span>
            <p class="mt-1 font-body-sm text-text-primary">{{ employmentStatusLabel[worker.employmentStatus] }}</p>
          </div>
          <div class="rounded-lg bg-bg-canvas p-space-md">
            <span class="font-caption text-caption uppercase tracking-wider text-text-muted">Hak Akses Sistem</span>
            <p class="mt-1 font-body-sm text-text-primary">{{ accessLevelLabel[worker.accessLevel] }}</p>
          </div>
          <div class="rounded-lg bg-bg-canvas p-space-md sm:col-span-2">
            <span class="flex items-center gap-2 font-caption text-caption uppercase tracking-wider text-text-muted">
              <MapPin class="size-3.5" aria-hidden="true" />
              Alamat Domisili
            </span>
            <p class="mt-1 font-body-sm text-text-primary">{{ worker.address ?? 'Belum diisi' }}</p>
          </div>
        </div>

        <p class="flex items-center gap-2 rounded-lg px-space-md py-2 font-label-md text-label-md" :class="statusTone">
          <CircleCheck class="size-4" aria-hidden="true" />
          Verifikasi profil: {{ statusLabel[worker.status] }}
          <span v-if="worker.isPic" class="ml-auto">Penanggung jawab modul monitoring</span>
        </p>
      </div>

      <div class="flex justify-end gap-space-sm border-t border-border-subtle px-space-xl py-space-md">
        <Button variant="outline" class="rounded-lg font-label-md text-label-md" @click="open = false">
          Tutup
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
