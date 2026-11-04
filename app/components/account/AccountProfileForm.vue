<script setup lang="ts">
import type { AccountProfileDto } from '~~/shared/types/account'
import type { UpdateAccountProfileInput } from '~~/shared/schemas/account.schema'
import { toTypedSchema } from '@vee-validate/zod'
import { Save } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { updateAccountProfileSchema } from '~~/shared/schemas/account.schema'
import { useAccountSettingsDraft } from '~/composables/useAccountSettingsDraft'
import { useUpdateAccountProfileMutation } from '~/composables/queries/useAccountQueries'
import { formatShortDateId } from '~/lib/format'

const props = defineProps<{ profile: AccountProfileDto | null }>()

const draft = useAccountSettingsDraft()
const mutation = useUpdateAccountProfileMutation()

const sections = [
  {
    number: 1,
    title: 'Identitas & Kredensial Klinis',
    hint: 'Sesuai dokumen STR, SIP, dan KTP yang terverifikasi.',
  },
  {
    number: 2,
    title: 'Kontak, Lokasi Praktik & Bio',
    hint: 'Dipakai untuk penjadwalan jaga dan profil publik di kartu identitas.',
  },
] as const

const emptyValues = {
  fullName: '',
  nik: '',
  strNumber: '',
  strExpiryDate: '',
  sipNumber: '',
  sipIssuer: '',
  kkiNumber: '',
  specialization: '',
  email: '',
  phone: '',
  address: '',
  bio: '',
}

/**
 * Nilai field bisa berupa string (sebelum validasi) atau Date (z.coerce.date() hasil cast
 * skema). input[type=date] hanya menerima "yyyy-mm-dd", jadi selalu dinormalisasi lewat UTC.
 */
function toDateInput(value?: string | Date | null) {
  if (!value)
    return ''
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

function valuesFromProfile(profile: AccountProfileDto) {
  return {
    fullName: profile.fullName,
    nik: profile.nik,
    strNumber: profile.strNumber,
    strExpiryDate: toDateInput(profile.strExpiryDate),
    sipNumber: profile.sipNumber ?? '',
    sipIssuer: profile.sipIssuer ?? '',
    kkiNumber: profile.kkiNumber ?? '',
    specialization: profile.specialization ?? '',
    email: profile.email,
    phone: profile.phone,
    address: profile.address ?? '',
    bio: profile.bio ?? '',
  }
}

const { handleSubmit, meta, resetForm, values } = useForm<typeof emptyValues, UpdateAccountProfileInput>({
  validationSchema: toTypedSchema(updateAccountProfileSchema),
  initialValues: emptyValues,
})

// resetForm (bukan setValues) supaya flag dirty tidak ikut aktif saat data server masuk.
watch(
  () => props.profile,
  (profile) => {
    if (profile)
      resetForm({ values: valuesFromProfile(profile), errors: {}, touched: {} })
  },
  { immediate: true },
)

const bioLength = computed(() => String(values.bio ?? '').length)
const strExpiryLabel = computed(() => formatShortDateId(toDateInput(values.strExpiryDate)))
const hasChanges = computed(() => meta.value.dirty || draft.avatarDirty.value)

const onSubmit = handleSubmit((formValues) => {
  mutation.mutate(
    {
      ...formValues,
      // Kirim hanya bila foto berubah; URL lama (mis. CDN seed) tidak lolos skema data URL.
      ...(draft.avatarDirty.value ? { avatarUrl: draft.avatarUrl.value ?? '' } : {}),
    },
    { onSuccess: () => draft.markProfileSaved() },
  )
})

function submit() {
  if (!props.profile || !hasChanges.value)
    return false
  void onSubmit()
  return true
}

defineExpose({ hasChanges, isSaving: mutation.isPending, submit })
</script>

<template>
  <form class="flex flex-col gap-space-lg rounded-xl bg-surface-card p-space-lg shadow-sm" @submit.prevent="submit">
    <section v-for="section in sections" :key="section.number" class="flex flex-col gap-space-md">
      <div class="flex items-center gap-space-sm border-b border-border-subtle pb-2">
        <span
          class="flex size-6 items-center justify-center rounded-full bg-primary font-label-sm text-label-sm text-primary-foreground"
        >
          {{ section.number }}
        </span>
        <div class="min-w-0">
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
                <Input v-bind="componentField" autocomplete="off" class="h-10 rounded-lg" />
              </FormControl>
              <p class="font-caption text-caption text-text-muted">
                Gelar profesional harus sesuai ijazah dan STR yang didaftarkan.
              </p>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="strNumber">
            <FormItem class="flex flex-col gap-1.5">
              <FormLabel class="font-label-md text-label-md">Nomor STR</FormLabel>
              <FormControl>
                <Input v-bind="componentField" autocomplete="off" class="h-10 rounded-lg font-mono" />
              </FormControl>
              <p class="font-caption text-caption text-status-success">
                Berlaku s/d {{ strExpiryLabel }}
              </p>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField, value }" name="strExpiryDate">
            <FormItem class="flex flex-col gap-1.5">
              <FormLabel class="font-label-md text-label-md">Tanggal Kedaluwarsa STR</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField" :model-value="toDateInput(value)" type="date"
                  autocomplete="off" class="h-10 rounded-lg"
                />
              </FormControl>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="sipNumber">
            <FormItem class="flex flex-col gap-1.5">
              <FormLabel class="font-label-md text-label-md">
                Nomor SIP <span class="text-text-muted">(opsional)</span>
              </FormLabel>
              <FormControl>
                <Input
v-bind="componentField" autocomplete="off" class="h-10 rounded-lg font-mono"
                  placeholder="SIP-JKT-DKG-00421" />
              </FormControl>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="sipIssuer">
            <FormItem class="flex flex-col gap-1.5">
              <FormLabel class="font-label-md text-label-md">
                Penerbit SIP <span class="text-text-muted">(opsional)</span>
              </FormLabel>
              <FormControl>
                <Input
v-bind="componentField" autocomplete="off" class="h-10 rounded-lg"
                  placeholder="DPMPTSP DKI Jakarta" />
              </FormControl>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="nik">
            <FormItem class="flex flex-col gap-1.5">
              <FormLabel class="font-label-md text-label-md">NIK</FormLabel>
              <FormControl>
                <Input
v-bind="componentField" inputmode="numeric" maxlength="16" autocomplete="off"
                  class="h-10 rounded-lg font-mono" />
              </FormControl>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="kkiNumber">
            <FormItem class="flex flex-col gap-1.5">
              <FormLabel class="font-label-md text-label-md">
                Nomor KKI <span class="text-text-muted">(opsional)</span>
              </FormLabel>
              <FormControl>
                <Input
v-bind="componentField" inputmode="numeric" maxlength="20" autocomplete="off"
                  class="h-10 rounded-lg font-mono" placeholder="31092817" />
              </FormControl>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>
        </template>

        <template v-else>
          <FormField v-slot="{ componentField }" name="specialization">
            <FormItem class="flex flex-col gap-1.5">
              <FormLabel class="font-label-md text-label-md">
                Spesialisasi / Fokus Klinis <span class="text-text-muted">(opsional)</span>
              </FormLabel>
              <FormControl>
                <Input v-bind="componentField" autocomplete="off" class="h-10 rounded-lg" />
              </FormControl>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="phone">
            <FormItem class="flex flex-col gap-1.5">
              <FormLabel class="font-label-md text-label-md">Nomor Telepon / WA</FormLabel>
              <FormControl>
                <Input v-bind="componentField" type="tel" autocomplete="tel" class="h-10 rounded-lg font-mono" />
              </FormControl>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="email">
            <FormItem class="flex flex-col gap-1.5">
              <FormLabel class="font-label-md text-label-md">Email Klinis</FormLabel>
              <FormControl>
                <Input v-bind="componentField" type="email" autocomplete="email" class="h-10 rounded-lg" />
              </FormControl>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="address">
            <FormItem class="flex flex-col gap-1.5">
              <FormLabel class="font-label-md text-label-md">
                Lokasi Praktik / Domisili <span class="text-text-muted">(opsional)</span>
              </FormLabel>
              <FormControl>
                <Input v-bind="componentField" autocomplete="off" class="h-10 rounded-lg" />
              </FormControl>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="bio">
            <FormItem class="flex flex-col gap-1.5 sm:col-span-2">
              <div class="flex items-center justify-between gap-2">
                <FormLabel class="font-label-md text-label-md">
                  Bio Profesional <span class="text-text-muted">(opsional)</span>
                </FormLabel>
                <span class="font-caption text-caption text-text-muted">{{ bioLength }}/600</span>
              </div>
              <FormControl>
                <Textarea
v-bind="componentField" :rows="4" class="rounded-lg"
                  placeholder="Fokus klinis, pengalaman, dan tanggung jawab di klinik." />
              </FormControl>
              <FormMessage class="font-caption text-caption" />
            </FormItem>
          </FormField>
        </template>
      </div>
    </section>

    <div class="flex flex-wrap items-center justify-end gap-space-sm border-t border-border-subtle pt-space-md">
      <p class="mr-auto font-caption text-caption text-text-muted">
        Peran, status kepegawaian, dan hak akses diubah administrator lewat menu Data Petugas Kesehatan.
      </p>
      <Button
        type="submit"
        class="flex items-center gap-2 font-label-md text-label-md"
        :disabled="mutation.isPending.value || !props.profile"
      >
        <Save class="size-4" aria-hidden="true" />
        {{ mutation.isPending.value ? 'Menyimpan…' : 'Simpan Profil' }}
      </Button>
    </div>
  </form>
</template>
