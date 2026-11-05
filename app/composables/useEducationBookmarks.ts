import type { Ref } from 'vue'
import { ref } from 'vue'

const STORAGE_KEY = 'dentacare:education-bookmarks'

/** State bersama antar komponen — dimuat sekali dari localStorage saat diakses di browser. */
const bookmarkIds: Ref<string[]> = ref([])
let hydrated = false

function readStorage(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []
  }
  catch {
    return []
  }
}

export function useEducationBookmarks() {
  if (!hydrated && import.meta.client) {
    bookmarkIds.value = readStorage()
    hydrated = true
  }

  function persist(next: string[]) {
    bookmarkIds.value = next
    if (import.meta.client)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function isBookmarked(id: string) {
    return bookmarkIds.value.includes(id)
  }

  function toggle(id: string) {
    persist(isBookmarked(id) ? bookmarkIds.value.filter(bookmarkId => bookmarkId !== id) : [...bookmarkIds.value, id])
  }

  return { bookmarkIds, isBookmarked, toggle }
}
