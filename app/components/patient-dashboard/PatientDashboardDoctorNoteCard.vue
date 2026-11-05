<script setup lang="ts">
import type { CareDoctorNoteDto } from '~~/shared/types/care'
import { CLINIC_WHATSAPP_URL } from '~~/shared/types/care'
import { formatShortDateId } from '~/lib/format'
import { BadgeCheck, MessageCircle, Stethoscope } from 'lucide-vue-next'

defineProps<{
  doctorNote: CareDoctorNoteDto
  dpjpName: string | null
}>()

const whatsappHref = computed(() => {
  const text = 'Halo perawat klinik DentaCare Pro, saya ingin mengirim pertanyaan ke dokter penanggung jawab saya.'
  return `${CLINIC_WHATSAPP_URL}?text=${encodeURIComponent(text)}`
})
</script>

<template>
  <section class="relative flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface-card p-space-xl shadow-sm">
    <div class="mb-space-sm flex items-center gap-space-sm">
      <span class="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-surface text-primary">
        <Stethoscope class="size-6" aria-hidden="true" />
      </span>
      <div class="flex min-w-0 flex-col">
        <span class="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-text-primary">
          Pesan Dokter DPJP
          <BadgeCheck v-if="doctorNote.note" class="size-4 text-status-success" aria-hidden="true" />
        </span>
        <span class="truncate font-caption text-caption text-text-muted">
          {{ doctorNote.clinician ?? dpjpName ?? 'Dokter penanggung jawab belum tercatat' }}
          <template v-if="doctorNote.validatedAt"> • {{ formatShortDateId(doctorNote.validatedAt) }}</template>
        </span>
      </div>
    </div>

    <div
      class="mb-space-md rounded-xl p-space-md font-body-sm text-body-sm leading-relaxed"
      :class="doctorNote.note ? 'bg-primary-surface text-text-primary' : 'bg-bg-canvas text-text-secondary'"
    >
      <p v-if="doctorNote.note">
        “{{ doctorNote.note.replace(/\n+/g, ' ') }}”
      </p>
      <p v-else>
        Belum ada pesan personal dari dokter. Catatan DPJP akan muncul di sini setelah dokter
        memvalidasi instruksi perawatan Anda.
      </p>
    </div>

    <Button as-child variant="outline" class="w-full justify-center gap-2 rounded-lg shadow-sm">
      <a :href="whatsappHref" target="_blank" rel="noopener">
        <MessageCircle class="size-4" aria-hidden="true" />
        Kirim Pertanyaan via WhatsApp Perawat
      </a>
    </Button>
  </section>
</template>
