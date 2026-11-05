import type { EducationCategory, EducationFormat } from '~~/shared/schemas/education.schema'

export interface EducationArticleDto {
  id: string
  title: string
  excerpt: string
  body?: string
  category: EducationCategory
  format: EducationFormat
  coverImageUrl: string | null
  readMinutes: number
  isPublished: boolean
  isFeatured: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface EducationStatsDto {
  total: number
  published: number
  draft: number
  viewsTotal: number
}

export const educationCategoryLabel: Record<EducationCategory, string> = {
  menyikat: 'Teknik Menyikat & Flossing',
  kalkulus: 'Pencegahan Karang Gigi',
  gusi: 'Perawatan Gusi (Periodontal)',
  diet: 'Pola Makan Sehat Gigi',
  faq: 'Tanya Jawab Medis (FAQ)',
}

export const educationCategoryShortLabel: Record<EducationCategory, string> = {
  menyikat: 'Menyikat Gigi',
  kalkulus: 'Karang Gigi',
  gusi: 'Perawatan Gusi',
  diet: 'Diet & Nutrisi',
  faq: 'FAQ Medis',
}

export const educationFormatLabel: Record<EducationFormat, string> = {
  artikel: 'Artikel',
  video: 'Video',
  checklist: 'Infografis & Checklist',
}

export const educationCategoryBadgeClass: Record<EducationCategory, string> = {
  menyikat: 'bg-status-info-bg text-status-info',
  kalkulus: 'bg-status-success-bg text-status-success',
  gusi: 'bg-status-warning-bg text-status-warning',
  diet: 'bg-status-danger-bg text-status-danger',
  faq: 'bg-primary-surface text-primary',
}
