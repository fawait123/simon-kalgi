<script setup lang="ts">
import type { AccountProfileDto } from '~~/shared/types/account'
import { BadgeCheck, Save, ShieldCheck } from 'lucide-vue-next'
import { formatShortDateId } from '~/lib/format'

const props = defineProps<{
  profile: AccountProfileDto | null
  isSaving: boolean
  hasChanges: boolean
}>()

const emits = defineEmits<{ save: [] }>()

const verifiedChip = computed(() => {
  const hasStr = Boolean(props.profile?.strNumber)
  const hasSip = Boolean(props.profile?.sipNumber)
  if (hasStr && hasSip) return 'Akun Terverifikasi (STR & SIP Aktif)'
  if (hasStr) return 'Akun Terverifikasi (STR Aktif)'
  return 'Menunggu Kelengkapan Kredensial'
})
</script>

<template>
  <header class="flex flex-wrap items-start justify-between gap-space-md rounded-xl bg-primary p-space-lg text-primary-foreground">
    <div class="flex min-w-0 items-start gap-space-md">
      <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
        <ShieldCheck class="size-6" aria-hidden="true" />
      </span>
      <div class="min-w-0">
        <p class="font-label-sm text-label-sm uppercase tracking-[0.14em] text-primary-foreground/80">
          Pusat Kredensial Medis
        </p>
        <h1 class="mt-1 font-headline-lg text-headline-lg">
          Pengaturan Akun &amp; Profil Petugas
        </h1>
        <p class="mt-1 font-body-sm text-body-sm text-primary-foreground/80">
          <span class="font-semibold text-primary-foreground">{{ props.profile?.fullName ?? 'Menyiapkan data akun…' }}</span>
          <span v-if="props.profile"> &middot; {{ props.profile.medicalId }}</span>
          <span v-if="props.profile"> &middot; diperbarui {{ formatShortDateId(props.profile.updatedAt) }}</span>
        </p>
      </div>
    </div>

    <div class="flex flex-col items-end gap-space-sm">
      <span
        class="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 font-label-sm text-label-sm text-primary-foreground"
      >
        <BadgeCheck class="size-4" aria-hidden="true" />
        {{ verifiedChip }}
      </span>
      <Button
        type="button"
        variant="outline"
        class="flex items-center gap-2 bg-surface-card font-label-md text-label-md text-primary hover:bg-primary-highlight hover:text-primary"
        :disabled="props.isSaving || !props.profile"
        @click="emits('save')"
      >
        <Save class="size-4" :class="props.isSaving ? 'animate-pulse' : ''" aria-hidden="true" />
        {{ props.isSaving ? 'Menyimpan…' : 'Simpan Seluruh Data' }}
      </Button>
      <p v-if="props.hasChanges" class="font-caption text-caption text-primary-foreground/80">
        Ada perubahan yang belum disimpan.
      </p>
    </div>
  </header>
</template>
