<script setup lang="ts">
import { Clock, Zap } from 'lucide-vue-next'
</script>

<template>
  <section
    class="relative flex flex-col justify-between bg-gradient-to-br from-clinical-night via-primary-hover to-text-primary p-6 text-white sm:p-10 lg:col-span-5"
  >
    <div class="clinical-pattern-invert pointer-events-none absolute inset-0 opacity-10" aria-hidden="true" />

    <div class="relative">
      <span
        class="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 font-caption text-caption text-primary-highlight backdrop-blur-md"
      >
        <Zap class="size-3.5" aria-hidden="true" />
        Fitur Modul Klinis Terintegrasi
      </span>

      <h2 class="mb-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
        Standarisasi Rekam Medis Gigi &amp; Pemantauan Periodontal
      </h2>
      <p class="mb-6 text-xs leading-relaxed text-primary-highlight/80">
        Platform modern untuk dokumentasi odontogram terstandar FDI World Dental Federation dan
        komputasi otomatis indeks kebersihan gigi.
      </p>

      <div class="space-y-3.5">
        <div class="rounded-xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-md transition-colors hover:bg-white/15">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <span
                class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary-highlight/30 bg-primary-container/20 font-label-sm text-label-sm font-bold text-primary-highlight"
              >FDI</span>
              <div class="min-w-0">
                <h3 class="text-xs font-semibold text-white">Odontogram Dewasa 32 Gigi</h3>
                <p class="text-[11px] text-primary-highlight/70">
                  Pemetaan karies, tumpatan komposit, &amp; missing teeth
                </p>
              </div>
            </div>
            <span class="shrink-0 rounded-full bg-status-success/25 px-2 py-0.5 font-label-sm text-label-sm font-medium text-primary-highlight">32/32 Elemen</span>
          </div>
          <p class="mt-2.5 flex items-center gap-1.5 rounded-lg bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-primary-highlight/80">
            <span class="size-2 shrink-0 rounded-full bg-primary-highlight" aria-hidden="true" />
            Gigi 16: O (Karies Email) &bull; Gigi 36: Restorasi RK Baik
          </p>
        </div>

        <div class="rounded-xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-md transition-colors hover:bg-white/15">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <span
                class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary-highlight/30 bg-primary-container/20 font-label-sm text-label-sm font-bold text-primary-highlight"
              >OHI</span>
              <div class="min-w-0">
                <h3 class="text-xs font-semibold text-white">Skor OHI-S &amp; Kalkulus Otomatis</h3>
                <p class="text-[11px] text-primary-highlight/70">
                  Formula Greene &amp; Vermillion (1964) Terverifikasi
                </p>
              </div>
            </div>
            <span class="shrink-0 rounded-full bg-primary-container/25 px-2 py-0.5 font-label-sm text-label-sm font-bold text-primary-highlight">1.10 (Baik)</span>
          </div>
          <div class="mt-2.5 grid grid-cols-2 gap-2 text-[10px]">
            <div class="rounded bg-black/20 p-1.5">
              <span class="block text-primary-highlight/70">Debris Index (DI-S):</span>
              <span class="font-bold text-white">0.60 (Ringan)</span>
            </div>
            <div class="rounded bg-black/20 p-1.5">
              <span class="block text-primary-highlight/70">Calculus Index (CI-S):</span>
              <span class="font-bold text-white">0.50 (Normal)</span>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-md transition-colors hover:bg-white/15">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <span
                class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary-highlight/30 bg-primary-container/20 text-primary-highlight"
              >
                <Clock class="size-4" aria-hidden="true" />
              </span>
              <div class="min-w-0">
                <h3 class="text-xs font-semibold text-white">Monitoring &amp; Recall Kontrol Pasien</h3>
                <p class="text-[11px] text-primary-highlight/70">
                  Notifikasi WhatsApp terjadwal untuk kontrol periodik
                </p>
              </div>
            </div>
            <span class="shrink-0 rounded bg-primary-highlight/20 px-2 py-0.5 font-mono text-[10px] text-primary-highlight">Auto-Sync</span>
          </div>
        </div>
      </div>

      <p class="mt-6 rounded-xl border border-primary-highlight/20 bg-clinical-night/40 p-3 text-xs italic leading-relaxed text-primary-highlight/90">
        &ldquo;Mempermudah dokumentasi periodonsia, pelacakan indeks kalkulus, dan edukasi kebersihan
        mulut pasien secara terintegrasi.&rdquo;
      </p>
    </div>

    <div class="relative mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-primary-highlight/70">
      <span>Modul Teruji Klinis FKG</span>
      <span>Sistem Informasi Kedokteran Gigi</span>
    </div>
  </section>
</template>
