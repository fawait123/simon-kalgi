import type { Prisma, PrismaClient } from '@prisma/client'

/**
 * Seed rekam medis portal pasien (examinations + examination_teeth + examination_index_scores)
 * untuk pasien demo RM-2025-0142, supaya halaman /pasien/pemeriksaan punya odontogram penuh
 * dan riwayat lintas sesi.
 *
 * Dipanggil dari seed.ts SETELAH seedDashboardExaminations() dan dengan tanggal absolut:
 * penghapusannya hanya menyasar tiga tanggal di bawah, jadi baris hasil
 * seedDashboardExaminations() tetap utuh dan dua kali seed menghasilkan angka yang sama.
 */

const FEATURED_RECORD_NO = 'RM-2025-0142'
const INDEX_TOOTH_COUNT = 6
const DMFT_CONDITIONS: readonly ToothSeed['condition'][] = ['karies', 'tambalan', 'hilang']

type ToothCondition = 'sehat' | 'karies' | 'tambalan' | 'mahkota' | 'hilang'
type IndexSurface = 'buccal' | 'labial' | 'lingual'

type ToothSeed = {
  fdiNumber: number
  condition: ToothCondition
  note?: string
}

type IndexSeed = {
  fdiNumber: number
  surface: IndexSurface
  debrisValue: number
  calculusValue: number
}

type SessionSeed = {
  /** Kolom `@db.Date` → selalu tengah malam UTC agar tanggalnya tidak bergeser. */
  examDate: Date
  examinerMedicalId: string
  chiefComplaint: string
  bloodPressure: string
  heartRate: number
  gingivaCondition: string
  mobilityDegree: number
  mucosaCondition: string
  prescriptionNote: string
  hygieneDiagnosis: string
  planOfAction: string[]
  nextVisitAt: Date | null
  nextVisitNote: string | null
  /** Arsip gigi: `true` menulis 32 baris (termasuk yang sehat), `false` hanya gigi tercatat. */
  fullArch: boolean
  teeth: ToothSeed[]
  indexScores: IndexSeed[]
}

const UPPER_ARCH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const LOWER_ARCH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
const ALL_FDI = [...UPPER_ARCH, ...LOWER_ARCH]

const utcDay = (isoDate: string) => new Date(`${isoDate}T00:00:00.000Z`)

/**
 * Rantai tiga kunjungan: `nextVisitAt` sesi lama = tanggal sesi berikutnya, jadi riwayatnya
 * terbaca sebagai satu rencana perawatan yang berjalan, bukan tiga rekaman acak.
 */
const SESSIONS: readonly SessionSeed[] = [
  {
    examDate: utcDay('2026-10-28'),
    examinerMedicalId: 'DC-DOC-002',
    chiefComplaint:
      'Kontrol hasil scaling; masih terasa ngilu pada gigi belakang kanan atas saat minum dingin dan ingin menyelesaikan tambal gigi 16.',
    bloodPressure: '118/76',
    heartRate: 76,
    gingivaCondition: 'Gingivitis marginal ringan, BOP (+) sektoral, edema berkurang dibanding kunjungan sebelumnya',
    mobilityDegree: 0,
    mucosaCondition: 'Normal, Tidak ada lesi',
    prescriptionNote: 'Klorheksidin 0,12% bilas 1x sehari selama 7 hari; sikat gigi teknik Bass 2x2 menit.',
    hygieneDiagnosis:
      'Kalkulus derajat ringan dengan gingivitis sektoral; kebersihan mulut membaik, indeks debris masih di atas target pada molar kanan atas.',
    planOfAction: [
      'Restorasi Komposit Gigi 16 (Klas I Oklusal)',
      'Edukasi Teknik Menyikat Gigi (Bass Technique & Dental Floss)',
      'Aplikasi Fluorid Vernis (Kode: DT-15)',
    ],
    nextVisitAt: new Date('2026-11-18T07:30:00.000Z'),
    nextVisitNote: 'Restorasi komposit gigi 16 dan evaluasi ulang indeks OHI-S.',
    fullArch: true,
    teeth: [
      { fdiNumber: 16, condition: 'karies', note: 'Karies Klas I oklusal, belum kavitas tembus dentin' },
      { fdiNumber: 24, condition: 'karies', note: 'Karies awal permukaan proksimal, perlu radiograf periapikal' },
      { fdiNumber: 36, condition: 'karies', note: 'Karies sekunder di tepi restorasi lama' },
      { fdiNumber: 11, condition: 'tambalan', note: 'Restorasi komposit servikal, margin intak' },
      { fdiNumber: 46, condition: 'tambalan', note: 'Tumpatan amalgam oklusal stabil, tidak ada fraktur' },
      { fdiNumber: 21, condition: 'mahkota', note: 'Mahkota full crown pasca perawatan saluran akar' },
      { fdiNumber: 48, condition: 'hilang', note: 'Sisa akar diekstraksi 2023, perlu evaluasi radiograf' },
    ],
    indexScores: [
      { fdiNumber: 16, surface: 'buccal', debrisValue: 2, calculusValue: 1 },
      { fdiNumber: 11, surface: 'labial', debrisValue: 1, calculusValue: 1 },
      { fdiNumber: 26, surface: 'buccal', debrisValue: 1, calculusValue: 1 },
      { fdiNumber: 36, surface: 'lingual', debrisValue: 1, calculusValue: 1 },
      { fdiNumber: 31, surface: 'labial', debrisValue: 0, calculusValue: 0 },
      { fdiNumber: 46, surface: 'lingual', debrisValue: 1, calculusValue: 1 },
    ],
  },
  {
    examDate: utcDay('2026-07-14'),
    examinerMedicalId: 'DC-DOC-002',
    chiefComplaint:
      'Gusi berdarah saat menyikat gigi dan terasa banyak karang gigi di belakang gigi depan bawah.',
    bloodPressure: '122/80',
    heartRate: 82,
    gingivaCondition: 'Gingivitis marginal, edema ringan, BOP (+)',
    mobilityDegree: 1,
    mucosaCondition: 'Normal, Tidak ada lesi',
    prescriptionNote: 'Scaling & root planing; Klorheksidin 0,12% bilas 2x1 sehari selama 7 hari.',
    hygieneDiagnosis:
      'Kalkulus derajat sedang dengan gingivitis lokal; diindikasikan scaling & root planing serta profilaksis dental.',
    planOfAction: [
      'Scaling & Root Planing Rahang Atas & Bawah (Kode: DT-04)',
      'Edukasi Teknik Menyikat Gigi (Bass Technique & Dental Floss)',
    ],
    nextVisitAt: utcDay('2026-10-28'),
    nextVisitNote: 'Evaluasi hasil scaling dan kontrol karies gigi 16.',
    fullArch: false,
    teeth: [
      { fdiNumber: 16, condition: 'karies', note: 'Karies klas I oklusal, rencana restorasi komposit' },
      { fdiNumber: 24, condition: 'karies', note: 'Karies proksimal, masih stadium awal' },
      { fdiNumber: 26, condition: 'karies', note: 'Karies oklusal dengan plak retensi' },
      { fdiNumber: 36, condition: 'karies', note: 'Karies sekunder tepi restorasi lama' },
      { fdiNumber: 46, condition: 'karies', note: 'Karies oklusal dalam, belum terpulp' },
      { fdiNumber: 11, condition: 'tambalan', note: 'Restorasi komposit servikal' },
      { fdiNumber: 47, condition: 'tambalan', note: 'Tumpatan glas ionomer stabil' },
      { fdiNumber: 21, condition: 'mahkota', note: 'Mahkota pasca perawatan saluran akar, margin baik' },
      { fdiNumber: 48, condition: 'hilang', note: 'Sisa akar, direncanakan ekstraksi' },
    ],
    indexScores: [
      { fdiNumber: 16, surface: 'buccal', debrisValue: 2, calculusValue: 2 },
      { fdiNumber: 11, surface: 'labial', debrisValue: 1, calculusValue: 1 },
      { fdiNumber: 26, surface: 'buccal', debrisValue: 1, calculusValue: 2 },
      { fdiNumber: 36, surface: 'lingual', debrisValue: 2, calculusValue: 2 },
      { fdiNumber: 31, surface: 'labial', debrisValue: 0, calculusValue: 1 },
      { fdiNumber: 46, surface: 'lingual', debrisValue: 2, calculusValue: 2 },
    ],
  },
  {
    examDate: utcDay('2026-03-05'),
    examinerMedicalId: 'DC-DOC-001',
    chiefComplaint:
      'Belum pernah kontrol ke klinik dalam satu tahun terakhir, banyak karang gigi dan beberapa gigi ngilu.',
    bloodPressure: '128/84',
    heartRate: 88,
    gingivaCondition: 'Gingivitis generalisata, edema dan perdarahan menyeluruh, kalkulus banyak',
    mobilityDegree: 1,
    mucosaCondition: 'Stomatitis ringan',
    prescriptionNote: 'Scaling & root planing bertahap; Klorheksidin 0,12% bilas 2x1 sehari 7 hari.',
    hygieneDiagnosis:
      'Kalkulus derajat berat dengan gingivitis generalisata; kebersihan mulut kategori buruk dan perlu edukasi intensif.',
    planOfAction: [
      'Scaling & Root Planing Rahang Atas & Bawah (Kode: DT-04)',
      'Rontgen Periapikal Regio Tersuspisi',
      'Edukasi Teknik Menyikat Gigi (Bass Technique & Dental Floss)',
    ],
    nextVisitAt: utcDay('2026-07-14'),
    nextVisitNote: 'Lanjutan scaling sisi kiri dan evaluasi gingiva.',
    fullArch: false,
    teeth: [
      { fdiNumber: 16, condition: 'karies', note: 'Karies dalam oklusal, perlu uji vitalitas' },
      { fdiNumber: 24, condition: 'karies', note: 'Karies proksimal' },
      { fdiNumber: 26, condition: 'karies', note: 'Karies oklusal dengan retensi plak' },
      { fdiNumber: 36, condition: 'karies', note: 'Karies sekunder pada restorasi lama' },
      { fdiNumber: 46, condition: 'karies', note: 'Karies oklusal' },
      { fdiNumber: 14, condition: 'karies', note: 'Karies awal permukaan bukal' },
      { fdiNumber: 11, condition: 'tambalan', note: 'Restorasi komposit servikal lama' },
      { fdiNumber: 47, condition: 'tambalan', note: 'Tumpatan glas ionomer' },
      { fdiNumber: 21, condition: 'mahkota', note: 'Mahkota pasca perawatan saluran akar' },
      { fdiNumber: 48, condition: 'hilang', note: 'Sisa akar, belum diekstraksi' },
      { fdiNumber: 31, condition: 'hilang', note: 'Gigi hilang karena trauma, belum digantikan' },
    ],
    indexScores: [
      { fdiNumber: 16, surface: 'buccal', debrisValue: 2, calculusValue: 2 },
      { fdiNumber: 11, surface: 'labial', debrisValue: 2, calculusValue: 2 },
      { fdiNumber: 26, surface: 'buccal', debrisValue: 2, calculusValue: 2 },
      { fdiNumber: 36, surface: 'lingual', debrisValue: 2, calculusValue: 2 },
      { fdiNumber: 31, surface: 'labial', debrisValue: 1, calculusValue: 2 },
      { fdiNumber: 46, surface: 'lingual', debrisValue: 2, calculusValue: 2 },
    ],
  },
]

function roundTwo(value: number) {
  return Math.round(value * 100) / 100
}

function ohisCategoryOf(score: number): 'baik' | 'sedang' | 'buruk' {
  if (score <= 1.2) return 'baik'
  if (score <= 3) return 'sedang'
  return 'buruk'
}

/**
 * Sesi arsip penuh menulis 32 baris; sesi lama hanya menulis gigi yang dicatat, sisanya
 * dihitung sehat supaya `healthyTeeth` cocok dengan cara odontogram merender gigi tanpa baris.
 */
function expandedTeeth(session: SessionSeed): ToothSeed[] {
  if (session.fullArch) return ALL_FDI.map(fdiNumber => session.teeth.find(tooth => tooth.fdiNumber === fdiNumber) ?? { fdiNumber, condition: 'sehat' })
  const recorded = new Set(session.teeth.map(tooth => tooth.fdiNumber))
  const healthy = ALL_FDI.filter(fdiNumber => !recorded.has(fdiNumber)).map(fdiNumber => ({ fdiNumber, condition: 'sehat' as const }))
  return [...session.teeth, ...healthy]
}

/** Rumus yang sama dengan examination.service.ts: pembagi 6 gigi indeks, DMFT tanpa `mahkota`. */
function summarize(session: SessionSeed) {
  const debrisIndex = roundTwo(
    session.indexScores.reduce((total, row) => total + row.debrisValue, 0) / INDEX_TOOTH_COUNT,
  )
  const calculusIndex = roundTwo(
    session.indexScores.reduce((total, row) => total + row.calculusValue, 0) / INDEX_TOOTH_COUNT,
  )
  const ohisScore = roundTwo(debrisIndex + calculusIndex)

  const healthyTeeth = expandedTeeth(session).filter(tooth => tooth.condition === 'sehat').length
  const dmftScore = session.teeth.filter(tooth => DMFT_CONDITIONS.includes(tooth.condition)).length

  return { debrisIndex, calculusIndex, ohisScore, ohisCategory: ohisCategoryOf(ohisScore), healthyTeeth, dmftScore }
}

function toothRows(session: SessionSeed) {
  return expandedTeeth(session).map(tooth => ({
    fdiNumber: tooth.fdiNumber,
    condition: tooth.condition,
    note: tooth.note ?? null,
  }))
}

export async function seedPatientRecord(prisma: PrismaClient) {
  const patient = await prisma.patient.findUnique({
    where: { medicalRecordNo: FEATURED_RECORD_NO },
    select: { id: true, fullName: true },
  })
  const examiners = await prisma.healthWorker.findMany({
    where: { medicalId: { in: [...new Set(SESSIONS.map(session => session.examinerMedicalId))] } },
    select: { id: true, medicalId: true, fullName: true },
  })
  if (!patient || examiners.length === 0) {
    console.warn('Skip patient record seed: featured patient or examiners not found')
    return
  }

  const examinerOf = (medicalId: string) => examiners.find(examiner => examiner.medicalId === medicalId)
  const dates = SESSIONS.map(session => session.examDate)
  const creates: Prisma.ExaminationUncheckedCreateInput[] = []

  for (const session of SESSIONS) {
    const examiner = examinerOf(session.examinerMedicalId)
    if (!examiner) {
      console.warn(`Skip patient record session ${session.examDate.toISOString()}: examiner ${session.examinerMedicalId} not found`)
      continue
    }
    const summary = summarize(session)
    creates.push({
      patientId: patient.id,
      examinerId: examiner.id,
      examinerName: examiner.fullName,
      examDate: session.examDate,
      chiefComplaint: session.chiefComplaint,
      bloodPressure: session.bloodPressure,
      heartRate: session.heartRate,
      heartRhythm: 'reguler',
      gingivaCondition: session.gingivaCondition,
      mobilityDegree: session.mobilityDegree,
      mucosaCondition: session.mucosaCondition,
      prescriptionNote: session.prescriptionNote,
      hygieneDiagnosis: session.hygieneDiagnosis,
      planOfAction: session.planOfAction,
      debrisIndex: summary.debrisIndex,
      calculusIndex: summary.calculusIndex,
      ohisScore: summary.ohisScore,
      ohisCategory: summary.ohisCategory,
      healthyTeeth: summary.healthyTeeth,
      dmftScore: summary.dmftScore,
      status: 'final',
      nextVisitAt: session.nextVisitAt,
      nextVisitNote: session.nextVisitNote,
      teeth: { create: toothRows(session) },
      indexScores: { create: session.indexScores },
    })
  }

  await prisma.$transaction(async (tx) => {
    await tx.examination.deleteMany({ where: { patientId: patient.id, examDate: { in: dates } } })
    for (const data of creates) await tx.examination.create({ data })
  })

  console.log(
    `Seeded ${creates.length} patient portal examinations for ${patient.fullName} (${FEATURED_RECORD_NO})`,
  )
}
