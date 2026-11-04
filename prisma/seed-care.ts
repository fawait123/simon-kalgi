import type { PrismaClient } from '@prisma/client'

/**
 * Seed checklist kepatuhan portal pasien (care_tasks + care_task_completions).
 * Dipanggil dari seed.ts setelah seedMonitoring() supaya program pemantauan sudah ada.
 */

const CARE_BACKFILL_DAYS = 28
const FEATURED_RECORD_NO = 'RM-2025-0142'
/** Runtun penuh hari lampau pasien demo: 13, supaya "hari ini 3/5" masih punya tugas yang bisa dicentang. */
const FEATURED_STREAK_DAYS = 13
const FEATURED_TODAY_DONE = 3
const INSERT_BATCH = 2000

type CareTemplate = {
  session: 'pagi' | 'siang' | 'malam'
  title: string
  instruction: string
  timeStart: string
  timeEnd: string
}

type StoredTask = {
  id: string
  patientId: string
  title: string
  timeStart: string
}

type CompletionRow = {
  taskId: string
  patientId: string
  logDate: Date
  completedAt: Date
}

const CARE_TEMPLATES: readonly CareTemplate[] = [
  {
    session: 'pagi',
    title: 'Menyikat Gigi Teknik Bass Modifikasi 2 Menit',
    instruction: 'Posisikan bulu sikat 45 derajat di garis gusi, getarkan pendek 10 kali per segmen lalu sapu ke arah mahkota. Sikat permukaan dalam dan lidah tanpa tekanan berlebih pada bekas scaling.',
    timeStart: '06:30',
    timeEnd: '07:30',
  },
  {
    session: 'pagi',
    title: 'Bersihkan Sela Gigi (Dental Floss)',
    instruction: 'Gunakan 30 cm benang, bentuk huruf C menyapu sisi gigi sampai sedikit masuk di bawah gusi. Ganti bagian benang tiap sela agar bakteri tidak berpindah.',
    timeStart: '07:30',
    timeEnd: '08:30',
  },
  {
    session: 'siang',
    title: 'Berkumur Klorheksidin 0,12% Setelah Makan Siang',
    instruction: 'Kumur 10 ml selama 30 detik setelah makan, jangan ditelan, dan tunda makan/minum 30 menit sesudahnya. Maksimal dua kali sehari untuk menghindari noda sementara.',
    timeStart: '13:00',
    timeEnd: '14:00',
  },
  {
    session: 'malam',
    title: 'Aplikasi Gel Fluor / Sikat Gigi Malam',
    instruction: 'Sikat gigi setelah makan malam, lalu oles tipis gel fluor pada leher gigi yang sensitif. Jangan berkumur dengan air sesudahnya agar fluor bekerja sepanjang malam.',
    timeStart: '20:00',
    timeEnd: '21:00',
  },
  {
    session: 'malam',
    title: 'Evaluasi Plak dengan Tableta Indikator & Catat',
    instruction: 'Kunyah tableta indikator plak, sikat bagian yang masih berwarna, lalu catat sisanya di buku kontrol. Bawa catatan tersebut saat kontrol berikutnya.',
    timeStart: '21:00',
    timeEnd: '22:00',
  },
]

const TEMPLATE_TITLES = CARE_TEMPLATES.map(template => template.title)

// Kunci tanggal dihitung lokal: mengimpor service akan ikut menarik singleton Prisma kedua ke proses seed.
const WIB_OFFSET_MS = 420 * 60_000

function wibKeyOf(instant: Date) {
  return new Date(instant.getTime() + WIB_OFFSET_MS).toISOString().slice(0, 10)
}

function dayOffsetKey(key: string, offset: number) {
  const date = new Date(`${key}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString().slice(0, 10)
}

function minutesToClock(total: number) {
  const wrapped = ((total % 1440) + 1440) % 1440
  return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`
}

function clockToMinutes(clock: string) {
  const [hours = 0, minutes = 0] = clock.split(':').map(Number)
  return Number(hours) * 60 + Number(minutes)
}

/**
 * Konvensi repo: `completed_at` disimpan dengan field UTC = jam dinding WIB (instant nyata + 7 jam),
 * sama seperti `patientCareService.toggle`, sehingga `formatUtcTime` menampilkan "07:15" untuk 07:15 WIB.
 */
function wibWallClockToUtc(dateKey: string, clock: string) {
  return new Date(Date.parse(`${dateKey}T00:00:00.000Z`) + clockToMinutes(clock) * 60_000)
}

function seededRandom(seed: number) {
  let state = seed
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function chunked<T>(rows: T[], size: number): T[][] {
  const batches: T[][] = []
  for (let index = 0; index < rows.length; index += size) batches.push(rows.slice(index, index + size))
  return batches
}

export async function seedCareChecklist(prisma: PrismaClient) {
  const monitored = await prisma.patientMonitoring.findMany({
    select: { patientId: true, patient: { select: { medicalRecordNo: true } } },
  })
  const targetPatients = monitored
    .map(row => ({ id: row.patientId, medicalRecordNo: row.patient.medicalRecordNo }))
    .sort((a, b) => a.medicalRecordNo.localeCompare(b.medicalRecordNo))

  if (targetPatients.length === 0) {
    console.warn('Care checklist seed dilewati: belum ada pasien dengan program pemantauan')
    return
  }

  const patientIds = targetPatients.map(patient => patient.id)
  const today = wibKeyOf(new Date())
  const taskRows = targetPatients.flatMap((patient, patientIndex) => {
    // Jam bergeser per pasien agar "waktu anjuran" tidak identik di seluruh rekam medis.
    const shiftMinutes = patient.medicalRecordNo === FEATURED_RECORD_NO ? 0 : (patientIndex % 10) * 5
    return CARE_TEMPLATES.map((template) => {
      const start = clockToMinutes(template.timeStart) + shiftMinutes
      const end = clockToMinutes(template.timeEnd) + shiftMinutes
      return {
        patientId: patient.id,
        session: template.session,
        title: template.title,
        instruction: template.instruction,
        timeStart: minutesToClock(start),
        timeEnd: minutesToClock(end),
      }
    })
  })

  await prisma.$transaction([
    // Cascade menghapus log lama, jadi reseed tidak menabrak unique (taskId, logDate).
    prisma.careTask.deleteMany({ where: { patientId: { in: patientIds }, title: { in: TEMPLATE_TITLES } } }),
    prisma.careTask.createMany({ data: taskRows }),
  ])

  const storedTasks = await prisma.careTask.findMany({
    where: { patientId: { in: patientIds }, title: { in: TEMPLATE_TITLES } },
    select: { id: true, patientId: true, title: true, timeStart: true },
    orderBy: { createdAt: 'asc' },
  })
  const tasksByPatient = new Map<string, StoredTask[]>()
  for (const task of storedTasks) {
    const bucket = tasksByPatient.get(task.patientId)
    if (bucket) bucket.push(task)
    else tasksByPatient.set(task.patientId, [task])
  }

  const completionRows: CompletionRow[] = []
  for (const [index, patient] of targetPatients.entries()) {
    const tasks = (tasksByPatient.get(patient.id) ?? []).slice().sort((a, b) =>
      a.timeStart.localeCompare(b.timeStart) || a.title.localeCompare(b.title))
    if (tasks.length === 0) continue

    if (patient.medicalRecordNo === FEATURED_RECORD_NO) {
      completionRows.push(...featuredCompletions(tasks, today))
      continue
    }

    const rng = seededRandom(index * 7919)
    const chance = 0.45 + (index % 5) * 0.11
    for (let offset = CARE_BACKFILL_DAYS - 1; offset >= 0; offset -= 1) {
      const date = dayOffsetKey(today, -offset)
      // Hari berjalan dipotong supaya portal tidak tampil "semua tuntas" saat pasien baru pagi.
      const dayChance = offset === 0 ? chance * 0.5 : chance
      for (const task of tasks) {
        if (rng() >= dayChance) continue
        completionRows.push({
          taskId: task.id,
          patientId: task.patientId,
          logDate: new Date(`${date}T00:00:00.000Z`),
          completedAt: wibWallClockToUtc(date, minutesToClock(clockToMinutes(task.timeStart) + Math.floor(rng() * 45))),
        })
      }
    }
  }

  const batches = chunked(completionRows, INSERT_BATCH)
  await prisma.$transaction(batches.map(batch => prisma.careTaskCompletion.createMany({ data: batch })))
  console.log(
    `Seeded ${taskRows.length} care tasks dan ${completionRows.length} completions untuk ${targetPatients.length} pasien terpantau`,
  )
}

/**
 * Pasien demo: 13 hari lampau penuh (kartu "Runtun Disiplin" + chip bonus aktif), hari ini hanya 3 tugas
 * pagi/siang selesai sehingga "Tugas Hari Ini 3/5" dan dua tugas malam tetap interaktif.
 */
function featuredCompletions(tasks: StoredTask[], today: string): CompletionRow[] {
  const rows: CompletionRow[] = []
  const wallClocks = ['07:15', '07:22', '13:40', '20:35', '21:18']

  for (let offset = CARE_BACKFILL_DAYS - 1; offset >= 1; offset -= 1) {
    const date = dayOffsetKey(today, -offset)
    const doneCount = offset <= FEATURED_STREAK_DAYS
      ? tasks.length
      // Hari ke-14 sengaja tidak genap: di sinilah runtun berhenti, dan riwayat tetap punya tekstur.
      : offset === FEATURED_STREAK_DAYS + 1 ? tasks.length - 1 : (offset * 7) % tasks.length
    tasks.slice(0, doneCount).forEach((task, index) => {
      rows.push({
        taskId: task.id,
        patientId: task.patientId,
        logDate: new Date(`${date}T00:00:00.000Z`),
        completedAt: wibWallClockToUtc(date, wallClocks[index] ?? task.timeStart),
      })
    })
  }

  tasks.slice(0, FEATURED_TODAY_DONE).forEach((task, index) => {
    rows.push({
      taskId: task.id,
      patientId: task.patientId,
      logDate: new Date(`${today}T00:00:00.000Z`),
      completedAt: wibWallClockToUtc(today, wallClocks[index] ?? task.timeStart),
    })
  })

  return rows
}
