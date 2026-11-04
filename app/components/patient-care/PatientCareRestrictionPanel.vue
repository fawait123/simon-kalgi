<script setup lang="ts">
import { carePostProcedureRestrictions, CLINIC_WHATSAPP_URL } from '~~/shared/types/care'
import { Ban, MessageCircle, Stethoscope, TriangleAlert } from 'lucide-vue-next'
</script>

<template>
  <section
    class="flex flex-col gap-space-lg rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-sm"
    aria-labelledby="restriction-heading"
  >
    <div class="flex items-center gap-2">
      <span class="flex size-9 items-center justify-center rounded-lg bg-status-danger-bg text-status-danger">
        <Stethoscope class="size-5" aria-hidden="true" />
      </span>
      <h2 id="restriction-heading" class="font-headline-md text-headline-md text-text-primary">
        Pantangan Medis Pasca-Tindakan
      </h2>
    </div>

    <ul class="flex flex-col gap-space-md" role="list">
      <li
        v-for="item in carePostProcedureRestrictions"
        :key="item.title"
        class="flex gap-space-md rounded-lg border border-border-subtle bg-bg-canvas p-space-md"
      >
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-lg"
          :class="item.tone === 'danger' ? 'bg-status-danger-bg text-status-danger' : 'bg-status-warning-bg text-status-warning'"
        >
          <Ban v-if="item.icon === 'ban'" class="size-4" aria-hidden="true" />
          <TriangleAlert v-else class="size-4" aria-hidden="true" />
        </span>
        <div class="flex flex-col gap-1">
          <span class="font-headline-sm text-headline-sm text-text-primary">{{ item.title }}</span>
          <p class="font-body-sm text-body-sm text-text-secondary">{{ item.description }}</p>
        </div>
      </li>
    </ul>

    <a
      :href="CLINIC_WHATSAPP_URL"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center justify-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 font-label-md text-label-md text-primary-foreground transition-colors hover:bg-primary-hover"
    >
      <MessageCircle class="size-4" aria-hidden="true" />
      Hubungi Perawat Pendamping
    </a>
  </section>
</template>
