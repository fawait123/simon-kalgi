import type { Prisma, PrismaClient } from '@prisma/client'

/**
 * Seed kotak masuk notifikasi milik pasien (notifications.recipient_patient_id).
 * Dipanggil dari seed.ts setelah seedMonitoring() supaya status, jadwal, dan skor OHI-S nyata tersedia.
 */

const FEATURED_RECORD_NO = 'RM-2025-0142'
const LINK_DASHBOARD = '/pasien/dashboard'
const LINK_KEPATUHAN = '/pasien/kepatuhan'

type InboxCategory = 'pengingat' | 'jadwal' | 'sistem'

type InboxRow = {
  recipientPatientId: string
  category: InboxCategory
  title: string
  body: string
  link: string
  isRead: boolean
  createdAt: Date
  readAt: Date | null
}

/** Baris sebelum id penerima dan waktunya diisi — supaya satu jalur penulisan tidak menduplikasi logika. */
type InboxDraft = Omit<InboxRow, 'recipientPatientId' | 'createdAt' | 'readAt'>

const patientSelect = {
  id: true,
  medicalRecordNo: true,
  ohisScore: true,
  ohisCategory: true,
  nextVisitClinician: true,
  monitoring: { select: { status: true, scheduledVisitAt: true, scheduledVisitNote: true } },
} satisfies Prisma.PatientSelect

type MonitoredPatient = Prisma.PatientGetPayload<{ select: typeof patientSelect }>

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000)
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000)
}

function shortDate(value: Date | null) {
  if (!value) return null
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(value)
    .replace('.', '')
}

function scoreText(value: number | null) {
  return value === null ? null : value.toFixed(2)
}

export async function seedPatientInbox(prisma: PrismaClient) {
  const patients = await prisma.patient.findMany({
    where: { monitoring: { isNot: null } },
    orderBy: { medicalRecordNo: 'asc' },
    select: patientSelect,
  })

  if (patients.length === 0) {
    console.warn('Inbox pasien seed dilewati: belum ada pasien dengan program pemantauan')
    return
  }

  const rows = patients.flatMap((patient, index) =>
    patient.medicalRecordNo === FEATURED_RECORD_NO ? featuredRows(patient) : inboxRows(patient, index))

  await prisma.$transaction([
    // Predikat hanya pada penerima pasien, jadi 6 baris kotak masuk petugas tidak tersentuh.
    prisma.notification.deleteMany({ where: { recipientPatientId: { in: patients.map(p => p.id) } } }),
    prisma.notification.createMany({ data: rows }),
  ])

  console.log(`Seeded ${rows.length} patient inbox notifications untuk ${patients.length} pasien terpantau`)
}

/**
 * Pasien non-demo: 4 baris, plus 1 baris status untuk pasien yang belum terkontrol.
 * Baris pertama selalu belum dibaca supaya badge lonceng portal tidak pernah nol.
 */
function inboxRows(patient: MonitoredPatient, index: number): InboxRow[] {
  const scheduled = shortDate(patient.monitoring?.scheduledVisitAt ?? null)
  const program = patient.monitoring?.scheduledVisitNote ?? 'kontrol kebersihan mulut'
  const ohis = scoreText(patient.ohisScore)
  const clinician = patient.nextVisitClinician ?? 'DPJP klinik'
  const rows: InboxDraft[] = [
    {
      category: 'pengingat',
      title: 'Klinik mengirim pengingat jadwal kontrol',
      body: scheduled
        ? `Kontrol Anda dijadwalkan ${scheduled} (${program}). Konfirmasi kehadiran lewat portal agar perawat menyiapkan ruang tindakan.`
        : `Belum ada tanggal kontrol pada rekam medis Anda (${program}). Manfaatkan checklist perawatan mandiri sambil menunggu penjadwalan.`,
      link: LINK_DASHBOARD,
      isRead: false,
    },
    {
      category: 'sistem',
      title: 'Checklist perawatan mandiri Anda telah aktif',
      body: `${clinician} menyetujui instruksi tiga sesi harian (pagi, siang, malam). Centang setiap tugas agar runtun disiplin dan persentase kepatuhan Anda tercatat.`,
      link: LINK_KEPATUHAN,
      isRead: true,
    },
    {
      category: 'jadwal',
      title: scheduled ? `Jadwal kontrol diperbarui: ${scheduled}` : 'Rencana kontrol Anda sedang disusun',
      body: 'Perubahan jadwal selalu menggantikan rencana sebelumnya pada rekam medis. Lengkapi checklist sebelum hari H supaya penilaian klinik sebanding dengan kondisi harian Anda.',
      link: LINK_KEPATUHAN,
      isRead: true,
    },
    {
      category: 'pengingat',
      title: ohis ? `Skor OHI-S Anda: ${ohis}` : 'Skor OHI-S Anda belum diperbarui',
      body: ohis
        ? `Skor kebersihan mulut terakhir ${ohis} dengan kategori ${patient.ohisCategory ?? 'belum terklasifikasi'}. Bandingkan trennya dengan centangan harian pada halaman checklist.`
        : 'Nilai OHI-S terkini belum tercatat. Skor ini dipakai DPJP menilai hasil perawatan mandiri Anda.',
      link: LINK_KEPATUHAN,
      isRead: true,
    },
  ]

  if (patient.monitoring?.status !== 'terkontrol') {
    rows.push({
      category: 'sistem',
      title: patient.monitoring?.status === 'kritis'
        ? 'Pemantauan Anda berada pada prioritas tertinggi'
        : 'Kontrol Anda melewati tanggal yang direncanakan',
      body: 'Klinik menandai program pemantauan Anda belum sesuai jadwal. Selesaikan sisa tugas hari ini dan konfirmasi ulang tanggal kontrol melalui portal.',
      link: LINK_DASHBOARD,
      isRead: false,
    })
  }

  return rows.map((row, rowIndex) => {
    const createdAt = hoursAgo(index % 5 + rowIndex * 11 + 1)
    return {
      ...row,
      recipientPatientId: patient.id,
      createdAt,
      readAt: row.isRead ? new Date(createdAt.getTime() + 40 * 60_000) : null,
    }
  })
}

/**
 * Pasien demo: 12 baris (satu setengah halaman feed), 5 belum dibaca, 7 sudah dibaca dengan readAt,
 * waktu tersebar dari 4 menit sampai 9 hari lalu agar urutan "belum dibaca dulu" terlihat.
 */
function featuredRows(patient: MonitoredPatient): InboxRow[] {
  const scheduled = shortDate(patient.monitoring?.scheduledVisitAt ?? null) ?? 'menunggu penjadwalan'
  const ohis = scoreText(patient.ohisScore) ?? 'belum tercatat'
  const clinician = patient.nextVisitClinician ?? 'drg. Raditya Pratama'

  const spec: { category: InboxCategory, title: string, body: string, link: string, isRead: boolean, createdAt: Date }[] = [
    {
      category: 'pengingat',
      title: 'Klinik mengirim pengingat jadwal kontrol',
      body: `Kontrol Anda dijadwalkan ${scheduled}. Konfirmasi kehadiran lewat portal agar perawat menyiapkan ruang tindakan sesuai riwayat alergi Anda.`,
      link: LINK_DASHBOARD,
      isRead: false,
      createdAt: minutesAgo(4),
    },
    {
      category: 'jadwal',
      title: `Jadwal kontrol Anda diperbarui: ${scheduled}`,
      body: 'Scaling dan Root Planing · pengingat H-1 diaktifkan. Lengkapi checklist perawatan mandiri sebelum hari kontrol agar penilaian klinik sebanding dengan kondisi harian Anda.',
      link: LINK_KEPATUHAN,
      isRead: false,
      createdAt: minutesAgo(38),
    },
    {
      category: 'sistem',
      title: 'Runtun disiplin 13 hari penuh tercatat',
      body: 'Seluruh tugas pagi, siang, dan malam Anda tuntas 13 hari beruntun. Bonus disiplin perawatan aktif: catatan plak harian Anda otomatis dilampirkan ke rekam medis.',
      link: LINK_KEPATUHAN,
      isRead: false,
      createdAt: hoursAgo(3),
    },
    {
      category: 'pengingat',
      title: 'Dua tugas malam belum dicentang hari ini',
      body: 'Aplikasi gel fluor dan evaluasi plak dengan tableta indikator masih menunggu. Waktu anjuran berakhir 22:00 WIB; setelah itu tugas tercatat sebagai terlewat.',
      link: LINK_KEPATUHAN,
      isRead: false,
      createdAt: hoursAgo(6),
    },
    {
      category: 'sistem',
      title: 'Catatan klinis dari DPJP Anda',
      body: `${clinician} memperbarui catatan pemantauan pasca-tindakan. Baca pada kartu "Indeks OHI-S Pasca-Tindakan" sebelum mengubah rutinitas sikat gigi Anda.`,
      link: LINK_KEPATUHAN,
      isRead: false,
      createdAt: hoursAgo(11),
    },
    {
      category: 'jadwal',
      title: 'Pantangan pasca-tindakan berlaku 72 jam',
      body: 'Hindari makanan terlalu panas, dingin, dan keras selama 72 jam setelah scaling. Konsultasikan melalui WhatsApp klinik bila ngilu tidak mereda.',
      link: LINK_KEPATUHAN,
      isRead: true,
      createdAt: hoursAgo(26),
    },
    {
      category: 'pengingat',
      title: `Skor OHI-S Anda: ${ohis}`,
      body: 'Skor terkini turun dibandingkan nilai awal program. Tren perubahan dan target 1,20 dapat dibuka pada halaman checklist kepatuhan.',
      link: LINK_KEPATUHAN,
      isRead: true,
      createdAt: hoursAgo(31),
    },
    {
      category: 'sistem',
      title: 'Checklist perawatan mandiri Anda telah aktif',
      body: `${clinician} menyetujui instruksi tiga sesi harian. Ganti kepala sikat tiap tiga bulan dan bawa catatan plak saat kontrol berikutnya.`,
      link: LINK_KEPATUHAN,
      isRead: true,
      createdAt: hoursAgo(52),
    },
    {
      category: 'pengingat',
      title: 'Pengingat kontrol sebelumnya telah Anda konfirmasi',
      body: 'Konfirmasi kehadiran Anda tercatat dan perawat telah menyiapkan ruang tindakan. Batalkan melalui portal bila berhalangan agar jadwal dapat dialihkan.',
      link: LINK_DASHBOARD,
      isRead: true,
      createdAt: hoursAgo(75),
    },
    {
      category: 'jadwal',
      title: 'Rencana kontrol diganti oleh klinik',
      body: 'Jadwal lama otomatis digantikan pada rekam medis. Periksa kembali tanggal dan nama DPJP penanggung jawab sebelum hari kontrol.',
      link: LINK_DASHBOARD,
      isRead: true,
      createdAt: hoursAgo(101),
    },
    {
      category: 'sistem',
      title: 'Akun portal pasien Anda aktif',
      body: 'Portal menampilkan program pemantauan, checklist kepatuhan, dan kotak masuk ini. Ubah kata sandi melalui pengaturan akun secara berkala.',
      link: LINK_DASHBOARD,
      isRead: true,
      createdAt: hoursAgo(146),
    },
    {
      category: 'pengingat',
      title: 'Kontrol bulan lalu belum dicatat hasilnya',
      body: 'Kunjungan sebelumnya belum memiliki skor pembanding. Datang pada kontrol berikutnya membawa catatan plak harian Anda.',
      link: LINK_KEPATUHAN,
      isRead: true,
      createdAt: hoursAgo(219),
    },
  ]

  return spec.map(row => ({
    ...row,
    recipientPatientId: patient.id,
    readAt: row.isRead ? new Date(row.createdAt.getTime() + 90 * 60_000) : null,
  }))
}
