<script setup lang="ts">
import type { PatientDto } from '~~/shared/types/patient'
import {
  Eye,
  Pencil,
  Phone,
  RotateCcw,
  SearchX,
  Smile,
  Trash2,
  TriangleAlert,
} from 'lucide-vue-next'
import { calcAge, formatShortDateId, formatVisitSchedule, initialsOf } from '~/lib/format'
import {
  genderLabel,
  ohisAvatarClass,
  ohisBadgeClass,
  ohisCategoryLabel,
} from '~~/shared/types/patient'

const props = defineProps<{
  rows: PatientDto[]
  isPending?: boolean
  isError?: boolean
  errorText?: string
}>()

const emits = defineEmits<{
  view: [patient: PatientDto]
  edit: [patient: PatientDto]
  remove: [patient: PatientDto]
  examine: [patient: PatientDto]
  retry: []
}>()

const selectedIds = ref(new Set<string>())

watch(
  () => props.rows,
  (rows) => {
    const pageIds = new Set(rows.map(row => row.id))
    const next = new Set([...selectedIds.value].filter(id => pageIds.has(id)))
    if (next.size !== selectedIds.value.size)
      selectedIds.value = next
  },
)

const allSelected = computed(
  () => props.rows.length > 0 && props.rows.every(row => selectedIds.value.has(row.id)),
)
const someSelected = computed(
  () => !allSelected.value && props.rows.some(row => selectedIds.value.has(row.id)),
)
const selectAllModel = computed(() => {
  if (allSelected.value) return true
  if (someSelected.value) return 'indeterminate' as const
  return false
})

function toggleAll(value: boolean | 'indeterminate') {
  selectedIds.value = value === true ? new Set(props.rows.map(row => row.id)) : new Set()
}

function toggleRow(id: string, value: boolean | 'indeterminate') {
  const next = new Set(selectedIds.value)
  if (value === true) next.add(id)
  else next.delete(id)
  selectedIds.value = next
}

const skeletonRows = 8

function patientSubtitle(patient: PatientDto) {
  const age = calcAge(patient.birthDate)
  return age === null ? genderLabel[patient.gender] : `${genderLabel[patient.gender]}, ${age} Tahun`
}

function visitTitle(patient: PatientDto) {
  return formatVisitSchedule(patient.nextVisitAt) ?? patient.controlTitle ?? 'Belum ada jadwal kontrol'
}

function visitNote(patient: PatientDto) {
  return patient.controlNote ?? (patient.lastVisitAt ? `Terakhir ${formatShortDateId(patient.lastVisitAt)}` : 'Belum pernah berkunjung')
}
</script>

<template>
  <div class="rounded-xl bg-surface-card shadow-sm">
    <div v-if="isError" class="flex flex-col items-center gap-space-md p-space-2xl text-center">
      <span class="flex size-12 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger">
        <SearchX class="size-6" aria-hidden="true" />
      </span>
      <div class="flex flex-col gap-1">
        <span class="font-headline-sm text-headline-sm text-text-primary">Data pasien gagal dimuat</span>
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
      <Table class="font-body-md text-body-md">
        <TableHeader>
          <TableRow class="border-border-subtle bg-bg-canvas hover:bg-transparent">
            <TableHead class="w-12 px-4 text-center">
              <Checkbox
                :model-value="selectAllModel"
                aria-label="Pilih semua pasien di halaman ini"
                @update:model-value="toggleAll"
              />
            </TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-secondary">No. RM &amp; NIK</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-secondary">Nama Pasien / Profil</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-secondary">Tanggal Lahir</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-secondary">Kontak &amp; Alamat</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-secondary">Status OHI-S Terakhir</TableHead>
            <TableHead class="font-table-header text-table-header uppercase tracking-wider text-text-secondary">Kunjungan / Kontrol</TableHead>
            <TableHead class="w-36 text-center font-table-header text-table-header uppercase tracking-wider text-text-secondary">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <template v-if="isPending">
            <TableRow v-for="index in skeletonRows" :key="`skeleton-${index}`" class="border-border-subtle">
              <TableCell colspan="8" class="px-4">
                <Skeleton class="h-10 w-full" />
              </TableCell>
            </TableRow>
          </template>

          <template v-if="!isPending">
            <TableRow
              v-for="patient in rows"
              :key="patient.id"
              class="border-border-subtle hover:bg-bg-canvas/80"
            >
              <TableCell class="px-4 text-center">
                <Checkbox
                  :model-value="selectedIds.has(patient.id)"
                  :aria-label="`Pilih ${patient.fullName}`"
                  @update:model-value="value => toggleRow(patient.id, value)"
                />
              </TableCell>

              <TableCell class="whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="font-body-lg text-body-lg font-bold text-primary">{{ patient.medicalRecordNo }}</span>
                  <span class="font-caption text-caption text-text-muted">NIK: {{ patient.nik }}</span>
                </div>
              </TableCell>

              <TableCell>
                <div class="flex items-center gap-space-sm">
                  <span
                    class="flex size-9 shrink-0 items-center justify-center rounded-full font-label-sm text-label-sm font-bold"
                    :class="ohisAvatarClass[patient.ohisCategory ?? 'none']"
                  >
                    {{ initialsOf(patient.fullName) }}
                  </span>
                  <div class="flex min-w-0 flex-col">
                    <span class="truncate font-body-lg text-body-lg font-semibold text-text-primary">
                      {{ patient.fullName }}
                    </span>
                    <span class="font-caption text-caption text-text-muted">{{ patientSubtitle(patient) }}</span>
                  </div>
                </div>
              </TableCell>

              <TableCell class="whitespace-nowrap font-body-sm text-body-sm text-text-secondary">
                {{ formatShortDateId(patient.birthDate) }}
              </TableCell>

              <TableCell>
                <div class="flex max-w-[200px] flex-col">
                  <span class="flex items-center gap-1.5 font-body-sm text-body-sm text-text-primary">
                    <Phone class="size-[15px] text-status-success" aria-hidden="true" />
                    {{ patient.phone }}
                  </span>
                  <span class="truncate font-caption text-caption text-text-muted">{{ patient.address }}</span>
                </div>
              </TableCell>

              <TableCell class="whitespace-nowrap">
                <span
                  v-if="patient.ohisCategory"
                  class="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-label-sm text-label-sm font-semibold"
                  :class="ohisBadgeClass[patient.ohisCategory]"
                >
                  <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
                  {{ patient.ohisScore }} &bull; {{ ohisCategoryLabel[patient.ohisCategory] }}
                </span>
                <span v-else class="inline-flex items-center gap-1.5 rounded-md bg-surface-container-low px-2.5 py-1 font-label-sm text-label-sm text-text-muted">
                  Belum dinilai
                </span>
              </TableCell>

              <TableCell class="whitespace-nowrap">
                <div class="flex flex-col">
                  <span
                    class="flex items-center gap-1 font-body-sm text-body-sm font-medium"
                    :class="patient.controlPriority === 'urgent' ? 'text-status-danger' : 'text-primary'"
                  >
                    <TriangleAlert v-if="patient.controlPriority === 'urgent'" class="size-4" aria-hidden="true" />
                    {{ visitTitle(patient) }}
                  </span>
                  <span class="font-caption text-caption text-text-muted">{{ visitNote(patient) }}</span>
                </div>
              </TableCell>

              <TableCell class="text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="size-8 rounded-lg text-primary hover:bg-primary-surface"
                    :aria-label="`Pemeriksaan gigi baru untuk ${patient.fullName}`"
                    @click="emits('examine', patient)"
                  >
                    <Smile class="size-[18px]" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="size-8 rounded-lg text-text-secondary hover:bg-surface-container-low"
                    :aria-label="`Lihat detail ${patient.fullName}`"
                    @click="emits('view', patient)"
                  >
                    <Eye class="size-[18px]" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="size-8 rounded-lg text-text-secondary hover:bg-surface-container-low"
                    :aria-label="`Edit data ${patient.fullName}`"
                    @click="emits('edit', patient)"
                  >
                    <Pencil class="size-[18px]" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="size-8 rounded-lg text-status-danger hover:bg-status-danger-bg"
                    :aria-label="`Hapus data ${patient.fullName}`"
                    @click="emits('remove', patient)"
                  >
                    <Trash2 class="size-[18px]" aria-hidden="true" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </template>

          <TableRow v-if="!isPending && rows.length === 0" class="border-border-subtle">
            <TableCell colspan="8" class="px-4 py-space-2xl">
              <div class="flex flex-col items-center gap-space-sm text-center">
                <span class="flex size-12 items-center justify-center rounded-xl bg-surface-container-low text-text-muted">
                  <SearchX class="size-6" aria-hidden="true" />
                </span>
                <span class="font-headline-sm text-headline-sm text-text-primary">Pasien tidak ditemukan</span>
                <p class="max-w-sm font-body-md text-body-md text-text-secondary">
                  Tidak ada pasien yang cocok dengan kata kunci atau filter yang dipilih.
                </p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </template>
  </div>
</template>
