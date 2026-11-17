<script setup lang="ts">
import type { Component } from 'vue'
import type {
  CreateHealthWorkerInput,
  UpdateHealthWorkerInput,
} from '~~/shared/schemas/health-worker.schema'
import type { HealthWorkerDto } from '~~/shared/types/health-worker'
import { toTypedSchema } from '@vee-validate/zod'
import { Check, Save, UserPlus } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import {
  createHealthWorkerSchema,
  updateHealthWorkerSchema,
} from '~~/shared/schemas/health-worker.schema'
import {
  useCreateHealthWorkerMutation,
  useUpdateHealthWorkerMutation,
} from '~/composables/queries/useHealthWorkerQueries'

const props = defineProps<{ initial?: HealthWorkerDto | null }>()
const open = defineModel<boolean>('open', { required: true })

const createMutation = useCreateHealthWorkerMutation()
const updateMutation = useUpdateHealthWorkerMutation()

const isEdit = computed(() => Boolean(props.initial))
const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

const sections = [
  { number: 1, title: 'Informasi Pribadi', hint: 'Identitas resmi sesuai KTP dan rekam medis petugas.' },
  { number: 2, title: 'Kredensial Medis & Izin Praktek', hint: 'Nomor STR/SIP, spesialisasi, dan jadwal jaga klinis.' },
  { number: 3, title: 'Kontak & Alamat Domisili', hint: 'Kontak aktif untuk penugasan dan notifikasi darurat.' },
  { number: 4, title: 'Akun Sistem & Hak Akses', hint: 'Kredensial login modul monitoring klinik.' },
] as { number: number, title: string, hint: string, icon?: Component }[]

const roleOptions = [
  { value: 'spesialis', label: 'Dokter Gigi Spesialis' },
  { value: 'umum', label: 'Dokter Gigi Umum' },
  { value: 'perawat', label: 'Perawat Gigi' },
  { value: 'asisten', label: 'Dental Assistant' },
]

const employmentOptions = [
  { value: 'tetap', label: 'Pegawai Tetap Klinik' },
  { value: 'mitra', label: 'Dokter Mitra / Paruh Waktu' },
  { value: 'residen', label: 'Residen / Magang Klinis' },
]

const accessOptions = [
  { value: 'dokter', label: 'Dokter Gigi (Akses Penuh Pemeriksaan & Resep)' },
  { value: 'perawat', label: 'Perawat Gigi (Pencatatan OHI-S & Skrining)' },
  { value: 'admin', label: 'Admin Medis (Master Data)' },
]

function toDateInput(value?: string | Date | null) {
  if (!value)
    return ''
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

const emptyValues = {
  fullName: '',
  nik: '',
  birthDate: '',
  gender: '',
  employmentStatus: 'tetap',
  role: '',
  specialization: '',
  strNumber: '',
  strExpiryDate: '',
  phone: '',
  email: '',
  address: '',
  username: '',
  password: '',
  accessLevel: 'dokter',
  dutyDays: '',
  dutyTime: '',
  isPic: false,
}

function valuesFromWorker(worker: HealthWorkerDto) {
  return {
    ...emptyValues,
    fullName: worker.fullName,
    nik: worker.nik,
    birthDate: toDateInput(worker.birthDate),
    gender: worker.gender,
    employmentStatus: worker.employmentStatus,
    role: worker.role,
    specialization: worker.specialization ?? '',
    strNumber: worker.strNumber,
    strExpiryDate: toDateInput(worker.strExpiryDate),
    phone: worker.phone,
    email: worker.email,
    address: worker.address ?? '',
    username: worker.username,
    password: '',
    accessLevel: worker.accessLevel,
    dutyDays: worker.dutyDays,
    dutyTime: worker.dutyTime,
    isPic: worker.isPic,
  }
}

const { handleSubmit, resetForm, setValues } = useForm<typeof emptyValues, CreateHealthWorkerInput>({
  validationSchema: computed(() =>
    toTypedSchema(isEdit.value ? updateHealthWorkerSchema : createHealthWorkerSchema)),
  initialValues: emptyValues,
})

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen)
      return
    if (props.initial)
      setValues(valuesFromWorker(props.initial))
    else resetForm({ values: emptyValues })
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  const body: Record<string, unknown> = { ...values }
  if (!body.specialization)
    delete body.specialization
  if (!body.address)
    delete body.address

  if (isEdit.value && props.initial) {
    if (!body.password)
      delete body.password
    updateMutation.mutate(
      { id: props.initial.id, body: body as UpdateHealthWorkerInput },
      { onSuccess: () => open.value = false },
    )
    return
  }

  createMutation.mutate(body as CreateHealthWorkerInput, { onSuccess: () => open.value = false })
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-[70vw] min-w-[35vw] gap-0 overflow-hidden rounded-xl p-0">
      <div
        class="flex items-center gap-space-md border-b border-border-subtle bg-primary-surface px-space-xl py-space-lg">
        <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <UserPlus class="size-5" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <DialogTitle class="font-headline-md text-headline-md text-text-primary">
            {{ isEdit ? 'Edit Data Petugas Kesehatan' : 'Tambah Petugas Kesehatan' }}
          </DialogTitle>
          <DialogDescription class="font-body-sm text-body-sm text-text-secondary">
            Lengkapi master data tenaga medis untuk penugasan pemeriksaan dan monitoring pasien.
          </DialogDescription>
        </div>
      </div>

      <form class="flex max-h-[65vh] flex-col gap-space-lg overflow-y-auto px-space-xl py-space-lg" @submit="onSubmit">
        <section v-for="section in sections" :key="section.number" class="flex flex-col gap-space-md">
          <div class="flex items-center gap-space-sm border-b border-border-subtle pb-2">
            <span
              class="flex size-6 items-center justify-center rounded-full bg-primary font-label-sm text-label-sm text-primary-foreground">
              {{ section.number }}
            </span>
            <div class="flex flex-col">
              <h3 class="font-headline-sm text-headline-sm text-text-primary">{{ section.title }}</h3>
              <p class="font-caption text-caption text-text-muted">{{ section.hint }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-space-md sm:grid-cols-2">
            <template v-if="section.number === 1">
              <FormField v-slot="{ componentField }" name="fullName">
                <FormItem class="flex flex-col gap-1.5 sm:col-span-2">
                  <FormLabel class="font-label-md text-label-md">Nama Lengkap &amp; Gelar</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" autocomplete="off" class="h-10 rounded-lg"
                      placeholder="drg. Nama Lengkap, Sp.XX" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="nik">
                <FormItem class="flex flex-col gap-1.5">
                  <FormLabel class="font-label-md text-label-md">NIK</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" inputmode="numeric" maxlength="16" autocomplete="off"
                      class="h-10 rounded-lg font-mono" placeholder="16 digit angka" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="birthDate">
                <FormItem class="flex flex-col gap-1.5">
                  <FormLabel class="font-label-md text-label-md">Tanggal Lahir</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="date" autocomplete="off" class="h-10 rounded-lg" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField, errorMessage }" name="gender">
                <FormItem class="flex flex-col gap-1.5">
                  <span id="worker-gender-label"
                    :class="['font-label-md text-label-md', errorMessage ? 'text-destructive' : '']">
                    Jenis Kelamin
                  </span>
                  <FormControl>
                    <RadioGroup v-bind="componentField" aria-labelledby="worker-gender-label" class="flex gap-space-md">
                      <label class="flex items-center gap-2 font-body-sm">
                        <RadioGroupItem value="L" class="border-strong text-primary" />
                        Laki-laki
                      </label>
                      <label class="flex items-center gap-2 font-body-sm">
                        <RadioGroupItem value="P" class="border-strong text-primary" />
                        Perempuan
                      </label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField, errorMessage }" name="employmentStatus">
                <FormItem class="flex flex-col gap-1.5">
                  <Label for="worker-employment-status"
                    :class="['font-label-md text-label-md', errorMessage ? 'text-destructive' : '']">
                    Status Kepegawaian
                  </Label>
                  <FormControl>
                    <Select v-bind="componentField">
                      <SelectTrigger id="worker-employment-status" :aria-invalid="Boolean(errorMessage)"
                        class="h-10 rounded-lg bg-background font-body-sm">
                        <SelectValue placeholder="Pilih status kepegawaian" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="option in employmentOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>
            </template>

            <template v-if="section.number === 2">
              <FormField v-slot="{ componentField, errorMessage }" name="role">
                <FormItem class="flex flex-col gap-1.5">
                  <Label for="worker-role"
                    :class="['font-label-md text-label-md', errorMessage ? 'text-destructive' : '']">
                    Peran / Jabatan
                  </Label>
                  <FormControl>
                    <Select v-bind="componentField">
                      <SelectTrigger id="worker-role" :aria-invalid="Boolean(errorMessage)"
                        class="h-10 rounded-lg bg-background font-body-sm">
                        <SelectValue placeholder="Pilih peran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="option in roleOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="specialization">
                <FormItem class="flex flex-col gap-1.5">
                  <FormLabel class="font-label-md text-label-md">
                    Spesialisasi / Fokus Klinis <span class="text-text-muted">(opsional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" autocomplete="off" class="h-10 rounded-lg"
                      placeholder="Konservasi Gigi" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="strNumber">
                <FormItem class="flex flex-col gap-1.5">
                  <FormLabel class="font-label-md text-label-md">Nomor STR / SIP</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" autocomplete="off" class="h-10 rounded-lg font-mono"
                      placeholder="STR-2024-0001" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="strExpiryDate">
                <FormItem class="flex flex-col gap-1.5">
                  <FormLabel class="font-label-md text-label-md">Masa Berlaku STR</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="date" autocomplete="off" class="h-10 rounded-lg" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="dutyDays">
                <FormItem class="flex flex-col gap-1.5">
                  <FormLabel class="font-label-md text-label-md">Hari Jaga</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" autocomplete="off" class="h-10 rounded-lg"
                      placeholder="Senin - Jumat" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="dutyTime">
                <FormItem class="flex flex-col gap-1.5">
                  <FormLabel class="font-label-md text-label-md">Jam / Shift Jaga</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" autocomplete="off" class="h-10 rounded-lg"
                      placeholder="08:00 - 16:00 (Shift Pagi)" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ value, handleChange }" name="isPic" type="checkbox">
                <FormItem class="flex items-center gap-space-sm rounded-lg bg-bg-canvas p-space-md sm:col-span-2">
                  <FormControl>
                    <Checkbox id="worker-is-pic" :model-value="value"
                      class="size-4 rounded border-strong data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      @update:model-value="handleChange($event as boolean)" />
                  </FormControl>
                  <label for="worker-is-pic" class="flex flex-col cursor-pointer">
                    <span class="font-label-md text-label-md">Tunjuk sebagai PIC (Penanggung Jawab)</span>
                    <span class="font-caption text-caption text-text-muted">
                      Petugas ini menjadi penanggung jawab modul monitoring kalkulus.
                    </span>
                  </label>
                </FormItem>
              </FormField>
            </template>

            <template v-if="section.number === 3">
              <FormField v-slot="{ componentField }" name="phone">
                <FormItem class="flex flex-col gap-1.5">
                  <FormLabel class="font-label-md text-label-md">Nomor Telepon / WA</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="tel" autocomplete="tel" class="h-10 rounded-lg font-mono"
                      placeholder="081234567890" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="email">
                <FormItem class="flex flex-col gap-1.5">
                  <FormLabel class="font-label-md text-label-md">Email Klinis</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="email" autocomplete="email" class="h-10 rounded-lg"
                      placeholder="nama@klinik.co.id" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="address">
                <FormItem class="flex flex-col gap-1.5 sm:col-span-2">
                  <FormLabel class="font-label-md text-label-md">
                    Alamat Domisili <span class="text-text-muted">(opsional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea v-bind="componentField" rows="3" autocomplete="off" class="rounded-lg"
                      placeholder="Alamat lengkap sesuai domisili" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>
            </template>

            <template v-if="section.number === 4">
              <FormField v-slot="{ componentField }" name="username">
                <FormItem class="flex flex-col gap-1.5">
                  <FormLabel class="font-label-md text-label-md">Username</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" autocomplete="username" class="h-10 rounded-lg font-mono"
                      placeholder="sarah.jenkins" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="password">
                <FormItem class="flex flex-col gap-1.5">
                  <FormLabel class="font-label-md text-label-md">
                    {{ isEdit ? 'Password (kosongkan jika tidak diganti)' : 'Password Awal' }}
                  </FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="password" autocomplete="new-password" class="h-10 rounded-lg"
                      :required="!isEdit" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField, errorMessage }" name="accessLevel">
                <FormItem class="flex flex-col gap-1.5 sm:col-span-2">
                  <Label for="worker-access-level"
                    :class="['font-label-md text-label-md', errorMessage ? 'text-destructive' : '']">
                    Level Hak Akses
                  </Label>
                  <FormControl>
                    <Select v-bind="componentField">
                      <SelectTrigger id="worker-access-level" :aria-invalid="Boolean(errorMessage)"
                        class="h-10 rounded-lg bg-background font-body-sm">
                        <SelectValue placeholder="Pilih level akses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="option in accessOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>
            </template>
          </div>
        </section>

        <div class="flex items-center justify-end gap-space-sm border-t border-border-subtle pt-space-md">
          <Button type="button" variant="outline" class="font-label-md text-label-md" @click="open = false">
            Batal
          </Button>
          <Button type="submit" class="flex items-center text-white gap-2 font-label-md text-label-md"
            :disabled="isPending">
            <Check v-if="!isPending" class="size-4" aria-hidden="true" />
            <Save v-else class="size-4 animate-spin" aria-hidden="true" />
            {{ isEdit ? 'Simpan Perubahan' : 'Simpan Petugas' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
