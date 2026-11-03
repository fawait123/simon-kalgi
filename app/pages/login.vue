<script setup lang="ts">
import type { LoginRole } from '~~/shared/schemas/auth.schema'
import { ShieldCheck } from 'lucide-vue-next'
import { loginRoleConfigs } from '~~/shared/types/auth'

definePageMeta({ layout: false })

const role = ref<LoginRole>('nakes')
const config = computed(() => loginRoleConfigs[role.value])

useHead({ title: 'Masuk — DentaCare Pro' })
</script>

<template>
  <div class="flex min-h-screen flex-col justify-between bg-bg-canvas text-text-primary selection:bg-primary-highlight selection:text-clinical-night">
    <AuthTopBar />

    <main class="relative flex grow items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-10">
      <div class="clinical-pattern pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div class="pointer-events-none absolute -left-40 -top-40 size-96 rounded-full bg-primary-highlight/60 blur-3xl" aria-hidden="true" />
      <div class="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-status-success-bg blur-3xl" aria-hidden="true" />

      <div class="relative grid min-h-[640px] w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl border border-border-subtle/90 bg-surface-card shadow-xl shadow-border-subtle/60 lg:grid-cols-12">
        <section class="flex flex-col justify-between p-6 sm:p-10 lg:col-span-7 lg:p-12">
          <div>
            <span class="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-highlight bg-primary-surface px-3 py-1 font-caption text-caption font-medium text-clinical-night">
              <span class="size-2 animate-pulse rounded-full bg-primary-container" aria-hidden="true" />
              Akses Terbatas &bull; Tenaga Kesehatan Terverifikasi (Kemenkes / SatuSehat)
            </span>

            <h1 class="mb-2 font-headline-lg text-headline-lg font-bold tracking-tight text-text-primary">
              Masuk ke Sistem DentaCare Pro
            </h1>
            <p class="mb-6 text-sm leading-relaxed text-text-secondary">
              {{ config.description }}
            </p>

            <AuthLoginRoleTabs v-model:role="role" class="mb-6" />
            <AuthLoginForm :role="role" />
          </div>

          <div class="mt-8 flex items-center justify-between border-t border-border-subtle pt-4 text-[11px] text-text-muted">
            <span class="flex items-center gap-1.5">
              <ShieldCheck class="size-4 shrink-0 text-status-success" aria-hidden="true" />
              Enkripsi Kredensial Medis TLS 1.3 &bull; Terintegrasi Standar SatuSehat Kemenkes RI
            </span>
            <span class="hidden sm:inline">ID Server: JKT-MED-04</span>
          </div>
        </section>

        <AuthClinicalShowcase />
      </div>
    </main>

    <AuthFooter />
  </div>
</template>
