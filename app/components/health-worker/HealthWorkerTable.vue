<script setup lang="ts">
import type { HealthWorkerDto } from '~~/shared/types/health-worker'
import {
  BadgeCheck,
  Clock,
  Eye,
  Mail,
  Pencil,
  Phone,
  RotateCcw,
  SearchX,
  Trash2,
} from 'lucide-vue-next'
import { formatDateId, initialsOf } from '~/lib/format'
import {
  employmentStatusLabel,
  roleBadgeClass,
  roleLabel,
  statusBadgeClass,
  statusLabel,
} from '~~/shared/types/health-worker'

const props = defineProps<{
  rows: HealthWorkerDto[]
  page: number
  pageSize: number
  isPending?: boolean
  isError?: boolean
  errorText?: string
}>()

const emits = defineEmits<{
  view: [worker: HealthWorkerDto]
  edit: [worker: HealthWorkerDto]
  remove: [worker: HealthWorkerDto]
  retry: []
}>()

const skeletonRows = computed(() => Array.from({ length: props.pageSize }, (_, index) => index))

function rowNumber(index: number) {
  return (props.page - 1) * props.pageSize + index + 1
}
</script>

<template>
  <div class="rounded-xl bg-surface-card shadow-sm">
    <div v-if="isError" class="flex flex-col items-center gap-space-md p-space-2xl text-center">
      <span class="flex size-12 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger">
        <SearchX class="size-6" aria-hidden="true" />
      </span>
      <div class="flex flex-col gap-1">
        <span class="font-headline-sm text-headline-sm text-text-primary">Data petugas gagal dimuat</span>
        <p class="max-w-md font-body-md text-body-md text-text-secondary">
          {{ errorText ?? 'Koneksi ke basis data klinik terputus. Periksa kembali lalu muat ulang.' }}
        </p>
      </div>
      <Button type="button" variant="outline" class="gap-2 rounded-lg" @click="emits('retry')">
        <RotateCcw class="size-4" aria-hidden="true" />
        Muat Ulang
      </Button>
    </div>

    <template v-else>
      <Table class="font-body-sm text-body-sm">
        <TableHeader>
          <TableRow class="border-border-subtle hover:bg-transparent">
            <TableHead class="w-12 px-3 font-table-header text-table-header uppercase tracking-wider text-text-muted">No</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Profil &amp; Nama Petugas</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">NIK &amp; STR / SIP</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Jabatan &amp; Spesialisasi</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Kontak Medis</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Hari &amp; Jadwal Jaga</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-muted">Status</TableHead>
            <TableHead class="w-[132px] text-right font-table-header text-table-header uppercase tracking-wider text-text-muted">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <template v-if="isPending">
            <TableRow
              v-for="index in skeletonRows"
              :key="`skeleton-${index}`"
              class="border-border-subtle"
            >
              <TableCell class="px-3" colspan="8">
                <Skeleton class="h-10 w-full" />
              </TableCell>
            </TableRow>
          </template>

          <template v-if="!isPending">
            <TableRow
              v-for="(worker, index) in rows"
              :key="worker.id"
              class="border-border-subtle items-start hover:bg-surface-container-low"
            >
            <TableCell class="px-3 align-top font-body-sm text-text-secondary">
              {{ rowNumber(index) }}
            </TableCell>

            <TableCell class="align-top">
              <div class="flex items-start gap-space-sm">
                <Avatar class="mt-0.5 size-9">
                  <AvatarImage v-if="worker.avatarUrl" :src="worker.avatarUrl" :alt="worker.fullName" />
                  <AvatarFallback class="bg-primary-surface font-label-sm text-label-sm text-primary">
                    {{ initialsOf(worker.fullName) }}
                  </AvatarFallback>
                </Avatar>
                <div class="flex min-w-0 flex-col">
                  <span class="flex items-center gap-1 font-body-lg text-body-lg font-medium text-text-primary">
                    <span class="truncate">{{ worker.fullName }}</span>
                    <Tooltip v-if="worker.isPic">
                      <TooltipTrigger as-child>
                        <BadgeCheck class="size-4 shrink-0 text-primary" aria-label="Penanggung jawab modul" />
                      </TooltipTrigger>
                      <TooltipContent>Penanggung jawab modul</TooltipContent>
                    </Tooltip>
                  </span>
                  <span class="font-caption text-caption text-text-muted">ID Medis: {{ worker.medicalId }}</span>
                  <span class="font-caption text-caption text-text-muted">{{ employmentStatusLabel[worker.employmentStatus] }}</span>
                </div>
              </div>
            </TableCell>

            <TableCell class="align-top">
              <div class="flex flex-col gap-0.5">
                <span class="font-caption text-caption uppercase tracking-wider text-text-muted">NIK</span>
                <span class="font-mono text-text-primary">{{ worker.nik }}</span>
                <span class="mt-1 font-caption text-caption uppercase tracking-wider text-text-muted">STR / SIP</span>
                <span class="font-mono text-text-primary">{{ worker.strNumber }}</span>
                <span class="font-caption text-caption text-text-muted">Exp. {{ formatDateId(worker.strExpiryDate) }}</span>
              </div>
            </TableCell>

            <TableCell class="align-top">
              <div class="flex flex-col items-start gap-1">
                <span
                  class="rounded px-2 py-0.5 font-label-sm text-label-sm"
                  :class="roleBadgeClass[worker.role]"
                >
                  {{ roleLabel[worker.role] }}
                </span>
                <span v-if="worker.specialization" class="font-body-sm text-text-secondary">
                  {{ worker.specialization }}
                </span>
              </div>
            </TableCell>

            <TableCell class="align-top">
              <div class="flex flex-col gap-1">
                <span class="flex items-center gap-1.5 text-text-secondary">
                  <Phone class="size-[15px] text-text-muted" aria-hidden="true" />
                  {{ worker.phone }}
                </span>
                <span class="flex items-center gap-1.5 break-all text-text-secondary">
                  <Mail class="size-[15px] shrink-0 text-text-muted" aria-hidden="true" />
                  {{ worker.email }}
                </span>
              </div>
            </TableCell>

            <TableCell class="align-top">
              <div class="flex flex-col gap-1">
                <span class="font-body-sm text-text-primary">{{ worker.dutyDays }}</span>
                <span class="flex items-center gap-1.5 font-caption text-caption text-text-secondary">
                  <Clock class="size-[15px] text-text-muted" aria-hidden="true" />
                  {{ worker.dutyTime }}
                </span>
              </div>
            </TableCell>

            <TableCell class="align-top">
              <span
                class="inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-label-sm text-label-sm"
                :class="statusBadgeClass[worker.status]"
              >
                <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
                {{ statusLabel[worker.status] }}
              </span>
            </TableCell>

            <TableCell class="align-top">
              <div class="flex items-center justify-end gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="size-8 rounded-lg text-text-secondary hover:bg-primary-surface hover:text-primary"
                  aria-label="Lihat detail petugas"
                  @click="emits('view', worker)"
                >
                  <Eye class="size-[18px]" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="size-8 rounded-lg text-text-secondary hover:bg-primary-surface hover:text-primary"
                  aria-label="Edit data petugas"
                  @click="emits('edit', worker)"
                >
                  <Pencil class="size-[18px]" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="size-8 rounded-lg text-text-secondary hover:bg-status-danger-bg hover:text-status-danger"
                  aria-label="Hapus data petugas"
                  @click="emits('remove', worker)"
                >
                  <Trash2 class="size-[18px]" aria-hidden="true" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
          </template>

          <TableRow v-if="!isPending && rows.length === 0" class="border-border-subtle">
            <TableCell colspan="8" class="px-3 py-space-2xl">
              <div class="flex flex-col items-center gap-space-sm text-center">
                <span class="flex size-12 items-center justify-center rounded-xl bg-surface-container-low text-text-muted">
                  <SearchX class="size-6" aria-hidden="true" />
                </span>
                <span class="font-headline-sm text-headline-sm text-text-primary">Petugas tidak ditemukan</span>
                <p class="max-w-sm font-body-md text-body-md text-text-secondary">
                  Tidak ada tenaga medis yang cocok dengan kata kunci atau filter yang dipilih.
                </p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </template>
  </div>
</template>
