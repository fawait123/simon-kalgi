<script setup lang="ts">
import type { HealthWorkerRoleFilter, WorkerStatusFilter } from '~~/shared/schemas/health-worker.schema'
import { RotateCcw, Search } from 'lucide-vue-next'

const search = defineModel<string>('search', { required: true })
const role = defineModel<HealthWorkerRoleFilter>('role', { required: true })
const status = defineModel<WorkerStatusFilter>('status', { required: true })

const emits = defineEmits<{ reset: [] }>()

const roleOptions = [
  { value: 'all', label: 'Semua Peran / Jabatan' },
  { value: 'spesialis', label: 'Dokter Gigi Spesialis' },
  { value: 'umum', label: 'Dokter Gigi Umum' },
  { value: 'perawat', label: 'Perawat Gigi' },
  { value: 'asisten', label: 'Dental Assistant' },
]

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'cuti', label: 'Cuti' },
  { value: 'nonaktif', label: 'Non-Aktif' },
]
</script>

<template>
  <div
    class="flex flex-col items-stretch justify-between gap-space-md rounded-xl bg-surface-card p-space-md shadow-sm md:flex-row md:items-center"
  >
    <div class="flex flex-1 flex-col items-stretch gap-space-sm sm:flex-row sm:items-center">
      <div class="relative min-w-[260px] flex-1">
        <label for="worker-search" class="sr-only">Cari petugas kesehatan</label>
        <Search class="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-text-muted" aria-hidden="true" />
        <Input
          id="worker-search"
          v-model="search"
          type="search"
          autocomplete="off"
          placeholder="Cari nama, NIK, SIP/STR, atau spesialisasi..."
          class="h-10 rounded-lg bg-bg-canvas pl-9 font-body-sm text-body-sm placeholder:text-text-muted"
        />
      </div>

      <div class="min-w-[190px]">
        <Select v-model="role">
          <SelectTrigger id="worker-role-filter" class="h-10 rounded-lg bg-bg-canvas font-body-sm text-body-sm text-text-secondary" aria-label="Filter peran atau jabatan">
            <SelectValue placeholder="Semua Peran / Jabatan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in roleOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="min-w-[160px]">
        <Select v-model="status">
          <SelectTrigger id="worker-status-filter" class="h-10 rounded-lg bg-bg-canvas font-body-sm text-body-sm text-text-secondary" aria-label="Filter status petugas">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <Button type="button" variant="outline" class="h-10 shrink-0 gap-2 rounded-lg font-label-md text-label-md" @click="emits('reset')">
      <RotateCcw class="size-4" aria-hidden="true" />
      Reset Filter
    </Button>
  </div>
</template>
