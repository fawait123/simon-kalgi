<script setup lang="ts">
import type { CreatePatientInput, UpdatePatientInput } from '~~/shared/schemas/patient.schema'
import type { PatientDto } from '~~/shared/types/patient'
import { toTypedSchema } from '@vee-validate/zod'
import { ChevronDown, Info, KeyRound, Pencil, Save, UserPlus } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { createPatientSchema, updatePatientSchema } from '~~/shared/schemas/patient.schema'
import { DEFAULT_PORTAL_PASSWORD } from '~~/shared/types/patient'
import {
  useCreatePatientMutation,
  useNextMedicalRecordNoQuery,
  useUpdatePatientMutation,
} from '~/composables/queries/usePatientQueries'

const props = defineProps<{ initial?: PatientDto | null }>()
const open = defineModel<boolean>('open', { required: true })

const createMutation = useCreatePatientMutation()
const updateMutation = useUpdatePatientMutation()

const isEdit = computed(() => Boolean(props.initial))
const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

const nextRecordNoQuery = useNextMedicalRecordNoQuery(() => open.value && !isEdit.value)
const nextRecordNo = computed(() => nextRecordNoQuery.data.value?.data.medicalRecordNo ?? 'RM-2025-....')

const bloodTypeOptions = ['A', 'B', 'AB', 'O']

const sections = [
  { key: 'identity', title: 'A. Data Pribadi Pasien', icon: UserPlus },
  { key: 'contact', title: 'B. Kontak & Domisili', icon: UserPlus },
  { key: 'portal', title: 'C. Akun Akses Portal Pasien', icon: KeyRound },
  { key: 'medical', title: 'D. Riwayat Medis Khusus', icon: Info },
] as const

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
  gender: 'P',
  bloodType: '',
  phone: '',
  email: '',
  address: '',
  allergyAntibiotics: false,
  hypertension: false,
  diabetes: false,
}

const { handleSubmit, resetForm, setValues } = useForm<typeof emptyValues, CreatePatientInput>({
  validationSchema: computed(() =>
    toTypedSchema(isEdit.value ? updatePatientSchema : createPatientSchema)),
  initialValues: emptyValues,
})

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen)
      return
    if (props.initial) {
      setValues({
        ...emptyValues,
        fullName: props.initial.fullName,
        nik: props.initial.nik,
        birthDate: toDateInput(props.initial.birthDate),
        gender: props.initial.gender,
        bloodType: props.initial.bloodType ?? '',
        phone: props.initial.phone,
        email: props.initial.email ?? '',
        address: props.initial.address,
        allergyAntibiotics: props.initial.allergyAntibiotics,
        hypertension: props.initial.hypertension,
        diabetes: props.initial.diabetes,
      })
    }
    else {
      resetForm({ values: emptyValues })
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  const body = { ...values, bloodType: values.bloodType || undefined, email: values.email || undefined }

  if (isEdit.value && props.initial) {
    updateMutation.mutate(
      { id: props.initial.id, body: body as UpdatePatientInput },
      { onSuccess: () => open.value = false },
    )
    return
  }

  createMutation.mutate(body as CreatePatientInput, { onSuccess: () => open.value = false })
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-[70vw] min-w-[35vw] gap-0 overflow-hidden rounded-xl p-0">
      <div
        class="flex items-center gap-space-md border-b border-border-subtle bg-primary-surface/50 px-space-xl py-space-lg">
        <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-surface text-primary">
          <Pencil v-if="isEdit" class="size-5" aria-hidden="true" />
          <UserPlus v-else class="size-5" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <DialogTitle class="font-headline-md text-headline-md text-text-primary">
              {{ isEdit ? 'Edit Master Data Pasien' : 'Tambah Pasien Baru' }}
            </DialogTitle>
            <span
              class="rounded border border-primary-highlight bg-primary-surface px-2 py-0.5 font-label-sm text-label-sm font-semibold text-primary">
              {{ isEdit ? props.initial?.medicalRecordNo : `Auto: ${nextRecordNo}` }}
            </span>
          </div>
          <DialogDescription class="font-caption text-caption text-text-secondary">
            {{ isEdit
              ? 'Perbarui informasi demografi dan kontak pasien.'
              : 'Lengkapi profil pasien untuk sinkronisasi odontogram dan OHI-S.' }}
          </DialogDescription>
        </div>
      </div>

      <form class="flex max-h-[65vh] flex-col gap-space-lg overflow-y-auto px-space-xl py-space-lg" @submit="onSubmit">
        <section v-for="section in sections" v-show="section.key !== 'portal' || !isEdit" :key="section.key"
          class="flex flex-col gap-space-md">
          <div class="flex items-center gap-space-sm border-b border-border-subtle pb-2"
            :class="section.key === 'portal' ? 'border-primary-highlight' : ''">
            <component :is="section.icon" class="size-[18px] text-primary" aria-hidden="true" />
            <h3 class="font-label-md text-label-md font-bold uppercase tracking-wider"
              :class="section.key === 'portal' ? 'text-primary' : 'text-text-primary'">
              {{ section.title }}
            </h3>
            <span v-if="section.key === 'portal'"
              class="ml-auto rounded bg-primary-surface px-2 py-0.5 font-caption text-caption font-semibold text-primary">
              Simulasi Terintegrasi
            </span>
          </div>

          <template v-if="section.key === 'identity'">
            <div class="grid grid-cols-1 gap-space-md md:grid-cols-2">
              <FormField v-slot="{ componentField }" name="fullName">
                <FormItem class="flex flex-col gap-1.5">
                  <FormLabel class="font-label-md text-label-md">Nama Lengkap Pasien</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" autocomplete="off" class="h-10 rounded-lg"
                      placeholder="Contoh: Dian Restiana" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="nik">
                <FormItem class="flex flex-col gap-1.5">
                  <FormLabel class="font-label-md text-label-md">Nomor Induk Kependudukan (NIK)</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" inputmode="numeric" maxlength="16" autocomplete="off"
                      class="h-10 rounded-lg font-mono" placeholder="16 Digit NIK KTP / KK" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <div class="grid grid-cols-2 gap-space-sm">
                <FormField v-slot="{ componentField }" name="birthDate">
                  <FormItem class="flex flex-col gap-1.5">
                    <FormLabel class="font-label-md text-label-md">Tanggal Lahir</FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" type="date" autocomplete="off" class="h-10 rounded-lg" />
                    </FormControl>
                    <FormMessage class="font-caption text-caption" />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField, errorMessage }" name="bloodType">
                  <FormItem class="flex flex-col gap-1.5">
                    <Label for="patient-blood-type"
                      :class="['font-label-md text-label-md', errorMessage ? 'text-destructive' : '']">
                      Golongan Darah
                    </Label>
                    <FormControl>
                      <Select v-bind="componentField">
                        <SelectTrigger id="patient-blood-type" class="h-10 rounded-lg bg-background font-body-sm">
                          <SelectValue placeholder="- Pilih -" />
                          <ChevronDown class="size-4 text-text-muted" aria-hidden="true" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem v-for="option in bloodTypeOptions" :key="option" :value="option">
                            {{ option }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage class="font-caption text-caption" />
                  </FormItem>
                </FormField>
              </div>

              <FormField v-slot="{ componentField, errorMessage }" name="gender">
                <FormItem class="flex flex-col gap-1.5">
                  <span id="patient-gender-label"
                    :class="['font-label-md text-label-md', errorMessage ? 'text-destructive' : '']">
                    Jenis Kelamin
                  </span>
                  <FormControl>
                    <RadioGroup v-bind="componentField" aria-labelledby="patient-gender-label"
                      class="flex h-10 items-center gap-space-md">
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
            </div>
          </template>

          <template v-if="section.key === 'contact'">
            <div class="grid grid-cols-1 gap-space-md md:grid-cols-2">
              <FormField v-slot="{ componentField }" name="phone">
                <FormItem class="flex flex-col gap-1.5">
                  <FormLabel class="font-label-md text-label-md">No. Telepon / WhatsApp</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="tel" autocomplete="off" class="h-10 rounded-lg"
                      placeholder="0812xxxxxxxx" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="email">
                <FormItem class="flex flex-col gap-1.5">
                  <FormLabel class="font-label-md text-label-md">
                    Alamat Email <span class="text-text-muted">(opsional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="email" autocomplete="off" class="h-10 rounded-lg"
                      placeholder="pasien@email.com" />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="address">
                <FormItem class="flex flex-col gap-1.5 md:col-span-2">
                  <FormLabel class="font-label-md text-label-md">Alamat Lengkap KTP / Domisili</FormLabel>
                  <FormControl>
                    <Textarea v-bind="componentField" rows="2" autocomplete="off"
                      class="resize-none rounded-lg font-body-sm"
                      placeholder="Nama Jalan, RT/RW, Kelurahan, Kecamatan, Kota..." />
                  </FormControl>
                  <FormMessage class="font-caption text-caption" />
                </FormItem>
              </FormField>
            </div>
          </template>

          <template v-if="section.key === 'portal' && !isEdit">
            <div
              class="grid grid-cols-1 gap-space-md rounded-xl border border-primary-highlight bg-primary-surface/40 p-space-md md:grid-cols-2">
              <div class="flex flex-col gap-1">
                <span class="font-caption text-caption text-text-secondary">Username Otomatis</span>
                <Input :model-value="nextRecordNo" readonly
                  class="h-9 cursor-not-allowed rounded bg-surface-card font-mono text-text-secondary" />
              </div>
              <div class="flex flex-col gap-1">
                <span class="font-caption text-caption text-text-secondary">Password Awal (Default)</span>
                <Input :model-value="DEFAULT_PORTAL_PASSWORD" readonly
                  class="h-9 cursor-not-allowed rounded bg-surface-card font-mono text-text-secondary" />
              </div>
              <p class="font-caption text-caption italic text-text-muted md:col-span-2">
                Kredensial dapat digunakan pasien untuk melihat laporan kalkulus dan jadwal mandiri.
              </p>
            </div>
          </template>

          <template v-if="section.key === 'medical'">
            <div class="grid grid-cols-1 gap-space-sm md:grid-cols-3">
              <FormField v-for="field in [
                { name: 'allergyAntibiotics', label: 'Alergi Antibiotik / Obat' },
                { name: 'hypertension', label: 'Hipertensi / Tekanan Darah' },
                { name: 'diabetes', label: 'Diabetes Melitus' },
              ]" :key="field.name" v-slot="{ value, handleChange }" :name="field.name">
                <FormItem class="flex flex-row items-center gap-2.5 rounded-lg border border-border-subtle p-2.5">
                  <FormControl>
                    <Checkbox :model-value="value" @update:model-value="handleChange" />
                  </FormControl>
                  <FormLabel class="font-body-sm text-body-sm font-normal text-text-secondary">
                    {{ field.label }}
                  </FormLabel>
                </FormItem>
              </FormField>
            </div>
          </template>
        </section>

        <div v-if="isEdit"
          class="flex items-start gap-2.5 rounded-lg border border-status-info/20 bg-status-info-bg p-space-sm">
          <Info class="mt-0.5 size-5 shrink-0 text-status-info" aria-hidden="true" />
          <p class="font-caption text-caption text-text-secondary">
            Perubahan nama dan kontak pasien akan otomatis tersinkron ke rekapan rekam medis odontogram dan histori
            scoring OHI-S di sistem klinik.
          </p>
        </div>

        <div class="flex items-center justify-end gap-space-sm border-t border-border-subtle pt-space-md">
          <Button type="button" variant="outline" class="rounded-lg font-label-md text-label-md" @click="open = false">
            Batal
          </Button>
          <Button type="submit" :disabled="isPending" class="gap-1.5 rounded-lg font-label-md text-label-md">
            <Save class="size-[18px]" aria-hidden="true" />
            {{ isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Data Pasien' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
