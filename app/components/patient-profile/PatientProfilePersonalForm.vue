<script setup lang="ts">
import type { PatientPersonalInfoInput } from '~~/shared/schemas/patient-profile.schema'
import type { PatientProfileDto } from '~~/shared/types/patient-profile'
import { ChevronDown, Save } from 'lucide-vue-next'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { patientPersonalInfoSchema } from '~~/shared/schemas/patient-profile.schema'
import { useUpdatePatientProfileMutation } from '~/composables/queries/usePatientProfileQueries'
import { formatDateId } from '~/lib/format'

const props = defineProps<{ profile: PatientProfileDto }>()

const mutation = useUpdatePatientProfileMutation()

function toDateInput(value?: string | Date | null) {
  if (!value)
    return ''
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

const emptyValues = {
  fullName: '',
  nik: '',
  birthPlace: '',
  birthDate: '',
  gender: 'P',
  bloodType: '',
  phone: '',
  email: '',
  address: '',
  occupation: '',
}

function valuesFromProfile(profile: PatientProfileDto) {
  return {
    fullName: profile.fullName,
    nik: profile.nik,
    birthPlace: profile.birthPlace ?? '',
    birthDate: toDateInput(profile.birthDate),
    gender: profile.gender,
    bloodType: profile.bloodType ?? '',
    phone: profile.phone,
    email: profile.email ?? '',
    address: profile.address,
    occupation: profile.occupation ?? '',
  }
}

const { handleSubmit, meta, resetForm } = useForm<typeof emptyValues, PatientPersonalInfoInput>({
  validationSchema: toTypedSchema(patientPersonalInfoSchema),
  initialValues: emptyValues,
})

// resetForm (bukan setValues) supaya flag dirty tidak ikut aktif saat data server masuk.
watch(
  () => props.profile,
  (profile) => {
    resetForm({ values: valuesFromProfile(profile), errors: {}, touched: {} })
  },
  { immediate: true },
)

const hasChanges = computed(() => meta.value.dirty)
const updatedAtLabel = computed(() => formatDateId(props.profile.updatedAt))

const onSubmit = handleSubmit((values) => {
  mutation.mutate({
    fullName: values.fullName,
    nik: values.nik,
    birthPlace: values.birthPlace,
    birthDate: values.birthDate,
    gender: values.gender,
    bloodType: values.bloodType,
    phone: values.phone,
    email: values.email,
    address: values.address,
    occupation: values.occupation,
  })
})

function submit() {
  if (!hasChanges.value)
    return false
  void onSubmit()
  return true
}

defineExpose({ hasChanges, isSaving: mutation.isPending, submit })
</script>

<template>
  <form class="flex flex-col gap-space-lg rounded-xl bg-surface-card p-space-lg shadow-sm" @submit.prevent="submit">
    <div class="flex flex-wrap items-start justify-between gap-space-sm border-b border-border-subtle pb-2">
      <div class="min-w-0">
        <h3 class="font-headline-sm text-headline-sm text-text-primary">Data Diri &amp; Administrasi</h3>
        <p class="font-caption text-caption text-text-muted">
          Pastikan data sesuai dengan identitas resmi (KTP/Paspor).
        </p>
      </div>
      <p class="font-caption text-caption text-text-muted">Terakhir diperbarui: {{ updatedAtLabel }}</p>
    </div>

    <div class="grid grid-cols-1 gap-space-md sm:grid-cols-2">
      <FormField v-slot="{ componentField }" name="fullName">
        <FormItem class="flex flex-col gap-1.5 sm:col-span-2">
          <FormLabel class="font-label-md text-label-md">Nama Lengkap Sesuai KTP</FormLabel>
          <FormControl>
            <Input v-bind="componentField" autocomplete="off" class="h-10 rounded-lg" />
          </FormControl>
          <FormMessage class="font-caption text-caption" />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="nik">
        <FormItem class="flex flex-col gap-1.5">
          <FormLabel class="font-label-md text-label-md">Nomor Induk Kependudukan (NIK)</FormLabel>
          <FormControl>
            <Input
              v-bind="componentField" inputmode="numeric" maxlength="16" autocomplete="off"
              class="h-10 rounded-lg font-mono"
            />
          </FormControl>
          <FormMessage class="font-caption text-caption" />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="birthPlace">
        <FormItem class="flex flex-col gap-1.5">
          <FormLabel class="font-label-md text-label-md">
            Tempat Lahir <span class="text-text-muted">(opsional)</span>
          </FormLabel>
          <FormControl>
            <Input v-bind="componentField" autocomplete="off" class="h-10 rounded-lg" placeholder="Jakarta" />
          </FormControl>
          <FormMessage class="font-caption text-caption" />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField, value }" name="birthDate">
        <FormItem class="flex flex-col gap-1.5">
          <FormLabel class="font-label-md text-label-md">Tanggal Lahir</FormLabel>
          <FormControl>
            <Input
              v-bind="componentField" :model-value="toDateInput(value)" type="date"
              autocomplete="off" class="h-10 rounded-lg"
            />
          </FormControl>
          <FormMessage class="font-caption text-caption" />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="bloodType">
        <FormItem class="flex flex-col gap-1.5">
          <FormLabel class="font-label-md text-label-md">
            Golongan Darah <span class="text-text-muted">(opsional)</span>
          </FormLabel>
          <FormControl>
            <Select v-bind="componentField">
              <SelectTrigger class="h-10 rounded-lg bg-background font-body-sm">
                <SelectValue placeholder="- Pilih -" />
                <ChevronDown class="size-4 text-text-muted" aria-hidden="true" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in ['A', 'B', 'AB', 'O']" :key="option" :value="option">
                  {{ option }}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage class="font-caption text-caption" />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField, errorMessage }" name="gender">
        <FormItem class="flex flex-col gap-1.5">
          <span :class="['font-label-md text-label-md', errorMessage ? 'text-destructive' : '']">
            Jenis Kelamin
          </span>
          <FormControl>
            <RadioGroup v-bind="componentField" class="flex h-10 items-center gap-space-md">
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

      <FormField v-slot="{ componentField }" name="phone">
        <FormItem class="flex flex-col gap-1.5">
          <FormLabel class="font-label-md text-label-md">Nomor Telepon / WhatsApp</FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="tel" autocomplete="tel" class="h-10 rounded-lg font-mono" />
          </FormControl>
          <FormMessage class="font-caption text-caption" />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="email">
        <FormItem class="flex flex-col gap-1.5">
          <FormLabel class="font-label-md text-label-md">
            Email Pasien <span class="text-text-muted">(opsional)</span>
          </FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="email" autocomplete="email" class="h-10 rounded-lg" />
          </FormControl>
          <FormMessage class="font-caption text-caption" />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="occupation">
        <FormItem class="flex flex-col gap-1.5">
          <FormLabel class="font-label-md text-label-md">
            Pekerjaan <span class="text-text-muted">(opsional)</span>
          </FormLabel>
          <FormControl>
            <Input v-bind="componentField" autocomplete="off" class="h-10 rounded-lg" placeholder="Contoh: Guru" />
          </FormControl>
          <FormMessage class="font-caption text-caption" />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="address">
        <FormItem class="flex flex-col gap-1.5 sm:col-span-2">
          <FormLabel class="font-label-md text-label-md">Alamat Lengkap KTP &amp; Domisili</FormLabel>
          <FormControl>
            <Textarea
              v-bind="componentField" :rows="3" class="resize-none rounded-lg font-body-sm"
              placeholder="Nama jalan, RT/RW, kelurahan, kecamatan, kota, provinsi, kode pos"
            />
          </FormControl>
          <FormMessage class="font-caption text-caption" />
        </FormItem>
      </FormField>
    </div>

    <div class="flex flex-wrap items-center justify-end gap-space-sm border-t border-border-subtle pt-space-md">
      <Button
        type="button"
        variant="outline"
        class="rounded-lg font-label-md text-label-md"
        :disabled="mutation.isPending.value || !hasChanges"
        @click="resetForm({ values: valuesFromProfile(profile) })"
      >
        Batal
      </Button>
      <Button type="submit" class="gap-1.5 rounded-lg font-label-md text-label-md" :disabled="mutation.isPending.value">
        <Save class="size-4" aria-hidden="true" />
        {{ mutation.isPending.value ? 'Menyimpan…' : 'Simpan Pembaruan Identitas' }}
      </Button>
    </div>
  </form>
</template>
