<script setup lang="ts">
import type { PatientProfileDto } from '~~/shared/types/patient-profile'
import { ChevronDown, Save, ShieldCheck } from 'lucide-vue-next'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import type { z } from 'zod'
import { patientEmergencyContactSchema, patientInsuranceSchema } from '~~/shared/schemas/patient-profile.schema'
import { useUpdatePatientProfileMutation } from '~/composables/queries/usePatientProfileQueries'

const props = defineProps<{ profile: PatientProfileDto }>()

const mutation = useUpdatePatientProfileMutation()

const contactSchema = patientEmergencyContactSchema.merge(patientInsuranceSchema)
type ContactFormOutput = z.output<typeof contactSchema>
interface ContactFormInput {
  emergencyName: string
  emergencyRelation: string
  emergencyPhone: string
  emergencyEmail: string
  emergencyAddress: string
  insuranceType: string
  insurancePolicyNo: string
  insuranceClass: string
  insuranceValidUntil: string
}

const relationOptions = ['Istri / Suami', 'Orang Tua (Ayah / Ibu)', 'Anak', 'Saudara Kandung']
const insuranceOptions = [
  'BPJS Kesehatan (FKTP Terdaftar)',
  'Mandiri Inhealth Dental Indemnity',
  'Prudential PRUPrime Healthcare',
  'Pasien Umum / Bayar Mandiri',
]

function toDateInput(value?: string | Date | null) {
  if (!value)
    return ''
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

function valuesFromProfile(profile: PatientProfileDto): ContactFormInput {
  return {
    emergencyName: profile.emergencyName ?? '',
    emergencyRelation: profile.emergencyRelation ?? '',
    emergencyPhone: profile.emergencyPhone ?? '',
    emergencyEmail: profile.emergencyEmail ?? '',
    emergencyAddress: profile.emergencyAddress ?? '',
    insuranceType: profile.insuranceType ?? '',
    insurancePolicyNo: profile.insurancePolicyNo ?? '',
    insuranceClass: profile.insuranceClass ?? '',
    insuranceValidUntil: toDateInput(profile.insuranceValidUntil),
  }
}

const { handleSubmit, meta, resetForm } = useForm<ContactFormInput, ContactFormOutput>({
  validationSchema: toTypedSchema(contactSchema),
  initialValues: valuesFromProfile(props.profile),
})

watch(
  () => props.profile,
  profile => resetForm({ values: valuesFromProfile(profile), errors: {}, touched: {} }),
  { immediate: true },
)

const hasChanges = computed(() => meta.value.dirty)
const insuranceActive = computed(() => {
  const until = props.profile.insuranceValidUntil
  return Boolean(until && new Date(until) >= new Date())
})

const onSubmit = handleSubmit(values => mutation.mutate({
  emergencyName: values.emergencyName,
  emergencyRelation: values.emergencyRelation,
  emergencyPhone: values.emergencyPhone,
  emergencyEmail: values.emergencyEmail,
  emergencyAddress: values.emergencyAddress,
  insuranceType: values.insuranceType,
  insurancePolicyNo: values.insurancePolicyNo,
  insuranceClass: values.insuranceClass,
  insuranceValidUntil: values.insuranceValidUntil,
}))

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
    <section class="flex flex-col gap-space-md">
      <div class="flex items-center gap-space-sm border-b border-border-subtle pb-2">
        <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-status-warning-bg text-status-warning">
          <Save class="size-3.5" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <h3 class="font-headline-sm text-headline-sm text-text-primary">Kontak Darurat Keluarga</h3>
          <p class="font-caption text-caption text-text-muted">
            Pihak keluarga yang dapat dihubungi saat situasi darurat tindakan medis.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-space-md sm:grid-cols-2">
        <FormField v-slot="{ componentField }" name="emergencyName">
          <FormItem class="flex flex-col gap-1.5">
            <FormLabel class="font-label-md text-label-md">Nama Lengkap Kerabat</FormLabel>
            <FormControl>
              <Input v-bind="componentField" autocomplete="off" class="h-10 rounded-lg" placeholder="Contoh: Siti Aminah" />
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="emergencyRelation">
          <FormItem class="flex flex-col gap-1.5">
            <FormLabel class="font-label-md text-label-md">Hubungan Keluarga</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger class="h-10 rounded-lg bg-background font-body-sm">
                  <SelectValue placeholder="- Pilih -" />
                  <ChevronDown class="size-4 text-text-muted" aria-hidden="true" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in relationOptions" :key="option" :value="option">
                    {{ option }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="emergencyPhone">
          <FormItem class="flex flex-col gap-1.5">
            <FormLabel class="font-label-md text-label-md">Nomor Telepon / WhatsApp Darurat</FormLabel>
            <FormControl>
              <Input v-bind="componentField" type="tel" autocomplete="tel" class="h-10 rounded-lg font-mono" placeholder="0812xxxxxxxx" />
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="emergencyEmail">
          <FormItem class="flex flex-col gap-1.5">
            <FormLabel class="font-label-md text-label-md">
              Email Kerabat <span class="text-text-muted">(opsional)</span>
            </FormLabel>
            <FormControl>
              <Input v-bind="componentField" type="email" autocomplete="email" class="h-10 rounded-lg" />
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="emergencyAddress">
          <FormItem class="flex flex-col gap-1.5 sm:col-span-2">
            <FormLabel class="font-label-md text-label-md">
              Alamat Tempat Tinggal Kerabat <span class="text-text-muted">(opsional)</span>
            </FormLabel>
            <FormControl>
              <Textarea v-bind="componentField" :rows="2" class="resize-none rounded-lg font-body-sm" />
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>
      </div>
    </section>

    <section class="flex flex-col gap-space-md">
      <div class="flex flex-wrap items-center gap-space-sm border-b border-border-subtle pb-2">
        <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-surface text-primary">
          <ShieldCheck class="size-3.5" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <h3 class="font-headline-sm text-headline-sm text-text-primary">Penjamin / Asuransi Kesehatan</h3>
          <p class="font-caption text-caption text-text-muted">
            Data penjamin dipakai untuk penagihan klaim tindakan (cashless / reimbursement).
          </p>
        </div>
        <span
          class="ml-auto rounded-full px-2.5 py-1 font-caption text-caption font-semibold"
          :class="insuranceActive ? 'bg-status-success-bg text-status-success' : 'bg-surface-container-low text-text-muted'"
        >
          {{ insuranceActive ? 'Aktif & Terverifikasi' : 'Belum Aktif' }}
        </span>
      </div>

      <div class="grid grid-cols-1 gap-space-md sm:grid-cols-2">
        <FormField v-slot="{ componentField }" name="insuranceType">
          <FormItem class="flex flex-col gap-1.5">
            <FormLabel class="font-label-md text-label-md">Jenis Penjamin / Asuransi</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger class="h-10 rounded-lg bg-background font-body-sm">
                  <SelectValue placeholder="- Pilih -" />
                  <ChevronDown class="size-4 text-text-muted" aria-hidden="true" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in insuranceOptions" :key="option" :value="option">
                    {{ option }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="insurancePolicyNo">
          <FormItem class="flex flex-col gap-1.5">
            <FormLabel class="font-label-md text-label-md">Nomor Polis / Nomor Kartu Peserta</FormLabel>
            <FormControl>
              <Input v-bind="componentField" autocomplete="off" class="h-10 rounded-lg font-mono" placeholder="Contoh: 0001234567890" />
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="insuranceClass">
          <FormItem class="flex flex-col gap-1.5">
            <FormLabel class="font-label-md text-label-md">
              Kelas Rawat / Manfaat Gigi <span class="text-text-muted">(opsional)</span>
            </FormLabel>
            <FormControl>
              <Input v-bind="componentField" autocomplete="off" class="h-10 rounded-lg" placeholder="Contoh: Kelas 1" />
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, value }" name="insuranceValidUntil">
          <FormItem class="flex flex-col gap-1.5">
            <FormLabel class="font-label-md text-label-md">Masa Berlaku Polis</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField" :model-value="toDateInput(value)" type="date"
                autocomplete="off" class="h-10 rounded-lg"
              />
            </FormControl>
            <FormMessage class="font-caption text-caption" />
          </FormItem>
        </FormField>
      </div>
    </section>

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
        {{ mutation.isPending.value ? 'Menyimpan…' : 'Simpan Kontak & Asuransi' }}
      </Button>
    </div>
  </form>
</template>
