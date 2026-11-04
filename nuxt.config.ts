// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['shadcn-nuxt', '@nuxt/eslint'],
  css: ['~/assets/css/tailwind.css', 'vue-sonner/style.css'],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['@tanstack/vue-query', 'lucide-vue-next', '@lucide/vue'],
    },
  },
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },
  runtimeConfig: {
    // Secret penandatangan sesi (JWT HS256). Isi lewat NUXT_SESSION_SECRET, jangan hardcode.
    sessionSecret: '',
  },
  app: {
    head: {
      title: 'DentaCare Pro — Sistem Monitoring Kesehatan Gigi dan Mulut',
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
})
