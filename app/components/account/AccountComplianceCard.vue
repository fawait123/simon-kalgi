<script setup lang="ts">
import type { AccountProfileDto } from '~~/shared/types/account'
import { CircleCheck, CircleX, ShieldCheck } from 'lucide-vue-next'
import { formatShortDateId } from '~/lib/format'

const props = defineProps<{ profile: AccountProfileDto | null }>()

const items = computed(() => [
  {
    ok: Boolean(props.profile?.strNumber),
    title: 'Nomor STR terdaftar & masih aktif',
    detail: props.profile
      ? `STR ${props.profile.strNumber} · berlaku s/d ${formatShortDateId(props.profile.strExpiryDate)}`
      : 'Menyiapkan data kredensial…',
  },
  {
    ok: Boolean(props.profile?.sipNumber),
    title: 'Izin Praktek (SIP) terverifikasi DPMPTSP',
    detail: props.profile?.sipNumber
      ? `SIP ${props.profile.sipNumber} · ${props.profile.sipIssuer ?? 'penerbit tidak tercatat'}`
      : 'Nomor SIP belum diisi, hubungi administrator klinik.',
  },
  {
    ok: true,
    title: 'Kata sandi terenkripsi bcrypt',
    detail: 'Kredensial login disimpan sebagai hash, tidak pernah dikirim balik ke peramban.',
  },
  {
    ok: true,
    title: 'Setiap perubahan tercatat otomatis',
    detail: props.profile
      ? `Pembaruan terakhir ${formatShortDateId(props.profile.updatedAt)}.`
      : 'Menyiapkan data audit…',
  },
])
</script>

<template>
  <section class="flex flex-col gap-space-md rounded-xl border border-primary-highlight bg-primary-surface/40 p-space-md">
    <div class="flex items-center gap-2">
      <ShieldCheck class="size-[18px] text-primary" aria-hidden="true" />
      <h3 class="font-label-md text-label-md font-bold uppercase tracking-wider text-primary">
        Kepatuhan &amp; Keamanan Akun
      </h3>
    </div>

    <ul class="flex flex-col gap-space-sm">
      <li v-for="item in items" :key="item.title" class="flex items-start gap-2">
        <CircleCheck
          v-if="item.ok"
          class="mt-0.5 size-[18px] shrink-0 text-status-success"
          aria-hidden="true"
        />
        <CircleX v-else class="mt-0.5 size-[18px] shrink-0 text-status-warning" aria-hidden="true" />
        <div class="min-w-0">
          <p class="font-body-sm text-body-sm font-semibold text-text-primary">
            <span class="sr-only">{{ item.ok ? 'Terpenuhi: ' : 'Belum terpenuhi: ' }}</span>
            {{ item.title }}
          </p>
          <p class="font-caption text-caption text-text-secondary">{{ item.detail }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
