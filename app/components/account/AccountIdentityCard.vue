<script setup lang="ts">
import type { AccountProfileDto } from '~~/shared/types/account'
import { BadgeCheck, Camera, Trash2 } from 'lucide-vue-next'
import { accountAccessChipLabel, accountRoleChipLabel } from '~~/shared/types/account'
import { useAccountSettingsDraft } from '~/composables/useAccountSettingsDraft'
import { formatShortDateId, initialsOf } from '~/lib/format'

const props = defineProps<{ profile: AccountProfileDto }>()

const draft = useAccountSettingsDraft()
const fileInput = ref<HTMLInputElement | null>(null)

const previewUrl = computed(() => draft.avatarUrl.value ?? props.profile.avatarUrl)
const isTrashed = computed(() => draft.avatarUrl.value === null && props.profile.avatarUrl !== null)

function openFilePicker() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  draft.pickAvatar(input.files?.[0])
  input.value = ''
}
</script>

<template>
  <section class="flex flex-col gap-space-md rounded-xl bg-surface-card p-space-lg shadow-sm">
    <div class="flex items-start gap-space-md">
      <div class="relative shrink-0">
        <Avatar class="size-24 rounded-xl border border-border-subtle">
          <AvatarImage v-if="previewUrl" :src="previewUrl" :alt="props.profile.fullName" class="object-cover" />
          <AvatarFallback class="rounded-xl bg-primary-surface font-headline-md text-headline-md text-primary">
            {{ initialsOf(props.profile.fullName) }}
          </AvatarFallback>
        </Avatar>
        <span
          class="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-surface-card bg-status-success text-status-success-bg"
          title="Identitas terverifikasi"
        >
          <BadgeCheck class="size-4" aria-hidden="true" />
        </span>
      </div>

      <div class="min-w-0 flex-1">
        <h2 class="font-headline-md text-headline-md text-text-primary">{{ props.profile.fullName }}</h2>
        <div class="mt-2 flex flex-wrap gap-2">
          <span class="rounded-md bg-primary px-2.5 py-1 font-label-sm text-label-sm text-primary-foreground">
            {{ accountRoleChipLabel[props.profile.role] }}
          </span>
          <span class="rounded-md bg-surface-container-low px-2.5 py-1 font-label-sm text-label-sm text-text-secondary">
            {{ accountAccessChipLabel[props.profile.accessLevel] }}
          </span>
        </div>
        <dl class="mt-3 flex flex-col gap-1 font-caption text-caption text-text-secondary">
          <div class="flex flex-wrap gap-1">
            <dt class="font-semibold text-text-secondary">ID Tenaga Kesehatan:</dt>
            <dd class="font-mono text-text-primary">{{ props.profile.medicalId }}</dd>
          </div>
          <div class="flex flex-wrap gap-1">
            <dt class="font-semibold text-text-secondary">KKI ID:</dt>
            <dd class="font-mono text-text-primary">{{ props.profile.kkiNumber ?? 'Belum terdaftar' }}</dd>
          </div>
          <div class="flex flex-wrap gap-1">
            <dt class="font-semibold text-text-secondary">Terakhir Diperbarui:</dt>
            <dd>{{ formatShortDateId(props.profile.updatedAt) }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 border-t border-border-subtle pt-space-md">
      <Button
type="button" variant="outline" size="sm" class="gap-1.5 rounded-lg font-label-md text-label-md"
        :disabled="draft.isAvatarBusy.value" @click="openFilePicker">
        <Camera class="size-4" aria-hidden="true" />
        {{ draft.isAvatarBusy.value ? 'Memproses…' : 'Ubah Foto' }}
      </Button>
      <Button
type="button" variant="ghost" size="sm" class="gap-1.5 rounded-lg font-label-md text-label-md text-status-danger"
        :disabled="isTrashed" @click="draft.removeAvatar()">
        <Trash2 class="size-4" aria-hidden="true" />
        Hapus Foto
      </Button>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="sr-only"
        aria-label="Pilih file foto profil"
        @change="onFileChange"
      >
    </div>

    <p v-if="draft.avatarError.value" class="font-caption text-caption text-status-danger">
      {{ draft.avatarError.value }}
    </p>
    <p v-else-if="draft.avatarDirty.value" class="font-caption text-caption text-status-warning">
      Foto profil belum disimpan. Tekan "Simpan Seluruh Data" untuk menerapkan.
    </p>
    <p v-else class="font-caption text-caption text-text-muted">
      Foto otomatis dipotong kotak dan diperkecil di browser sebelum disimpan.
    </p>
  </section>
</template>
