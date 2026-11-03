<script setup lang="ts">
import { BriefcaseMedical } from 'lucide-vue-next'
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b border-border-subtle bg-surface-card shadow-sm">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3">
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20"
        >
          <BriefcaseMedical class="size-6" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-lg font-bold tracking-tight text-text-primary">
              DentaCare <span class="text-primary">Pro</span>
            </span>
            <span
              class="hidden rounded-full border border-primary-highlight bg-primary-surface px-2 py-0.5 font-label-sm text-label-sm uppercase tracking-wider text-primary sm:inline"
            >v2.4.0 Clinical</span>
          </div>
          <p class="hidden text-xs text-text-secondary sm:block">
            Sistem Monitoring Kesehatan Gigi &amp; Mulut &mdash; Portal Tenaga Medis
          </p>
        </div>
      </div>
    </div>
  </header>
</template>
