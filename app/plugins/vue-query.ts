import { QueryClient, VueQueryPlugin, dehydrate, hydrate } from '@tanstack/vue-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) {
    const ssrState = nuxtApp.payload.serverRendered ? dehydrate(queryClient) : undefined
    if (ssrState && Object.keys(ssrState.queries ?? {}).length > 0) {
      nuxtApp.payload.query = ssrState
    }
    nuxtApp.hook('app:rendered', () => {
      queryClient.clear()
    })
  } else if (nuxtApp.payload.query) {
    hydrate(queryClient, nuxtApp.payload.query)
  }

  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient })
})
