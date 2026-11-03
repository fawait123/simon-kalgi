import { PrismaClient } from '@prisma/client'
import { hashSync } from 'bcryptjs'

const prisma = new PrismaClient()

const passwordHash = hashSync('DentaCare2024!', 10)

const staff = [
  {
    medicalId: 'DC-DOC-001',
    fullName: 'drg. Sarah Jenkins, Sp.KG',
    nik: '3271025508890001',
    birthDate: new Date('1989-08-25'),
    gender: 'P',
    employmentStatus: 'tetap',
    role: 'spesialis',
    specialization: 'Konservasi Gigi (Sp.KG)',
    strNumber: '31.2.1.100.1.20.123456',
    strExpiryDate: new Date('2027-12-31'),
    phone: '081234567890',
    email: 'sarah.jenkins@dentacare.id',
    address: 'Jl. Sukajadi No. 45, Bandung',
    username: 'drg.sarah',
    accessLevel: 'dokter',
    dutyDays: 'Senin, Rabu, Jumat',
    dutyTime: '09:00 - 15:00 WIB',
    status: 'aktif',
    isPic: true,
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDd-paK-TCpdqKamtl1-e_CDpIAox8tpm8sBspbq7fgcXGmQUE8sv1pub2urhSbeSI7hfL0ut1jen8tpIdHqT3yn_--KBZVRyO8nZgDxEL2Nar5C1hS5zmNUgLeL0bF05STRaSai95yQz-E7wEGeH9GnUFyyZGLYhCM8CCaAkKxS2VVnkNxMldPfCI_XYcNGh1IVkO_eaqR9IMSYtagzZKFl6ftVfmaaJkKB2lwhTk',
  },
  {
    medicalId: 'DC-DOC-002',
    fullName: 'drg. Raditya Pratama, Sp.Perio',
    nik: '3271041203870002',
    birthDate: new Date('1987-03-12'),
    gender: 'L',
    employmentStatus: 'tetap',
    role: 'spesialis',
    specialization: 'Periodonsia & Kalkulus',
    strNumber: '31.2.1.100.1.19.654321',
    strExpiryDate: new Date('2027-08-31'),
    phone: '081298765432',
    email: 'raditya.p@dentacare.id',
    address: 'Jl. Cihampelas No. 12, Bandung',
    username: 'drg.raditya',
    accessLevel: 'dokter',
    dutyDays: 'Selasa, Kamis, Sabtu',
    dutyTime: '13:00 - 19:00 WIB',
    status: 'aktif',
    isPic: false,
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC3DgUCa_TJ09-SSFtQbmTGTVYTSy3Z1-PnoPkOhCTz_vyh3uTKC2kvOSF_oEF5WYutpDAMueOlO6V2DFUjAdaVTX1Nye5w66PIORfcrxjNWDLfZb1hBKz03i0ESBItM2JS8XYi3W3io2rMufaToz2FPGkI9ENeOJdBAPyWc6QFOR2I6WzoZ8XUtpLjGOB907cA9jcYldpYtdppFuYLQmpx8HibY_SmNNGQRyoK0Ts',
  },
  {
    medicalId: 'DC-DOC-003',
    fullName: 'drg. Maya Anindita',
    nik: '3271086604920003',
    birthDate: new Date('1992-04-26'),
    gender: 'P',
    employmentStatus: 'tetap',
    role: 'umum',
    specialization: 'Pemeriksaan Gigi Rutin',
    strNumber: '31.2.1.100.1.21.789012',
    strExpiryDate: new Date('2026-11-30'),
    phone: '081387654321',
    email: 'maya.anindita@dentacare.id',
    address: 'Jl. Dago No. 88, Bandung',
    username: 'drg.maya',
    accessLevel: 'dokter',
    dutyDays: 'Senin - Kamis',
    dutyTime: '08:00 - 14:00 WIB',
    status: 'aktif',
    isPic: false,
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAfDPAOLiDkIXJbNq0l9lPdnm0MaUyGl66VZ_6klN-pddI6JqR6oFQm_QtqS9TU4icKUDM9JoCQW8GYxLN3_vfj077AcehH4sVPwXgsERjoOD2SXOvf9Y3W2CO5m4OnzuaTVUgf5JML3FJF2EpYnr_UErRI0wHlZ5qJDbvd24UB0MJgqgH3gvxN4SuH0kiEYXkhOLVgJ2MWgTMtfvkuCdPGpXyYcV4ugZlfpvs5iMI',
  },
  {
    medicalId: 'DC-NUR-001',
    fullName: 'Ns. Dimas Setiawan, A.Md.Kes',
    nik: '3271051509900004',
    birthDate: new Date('1990-09-15'),
    gender: 'L',
    employmentStatus: 'tetap',
    role: 'perawat',
    specialization: 'Asistensi Operatori & Sterilisasi',
    strNumber: '31.1.2.200.2.18.456789',
    strExpiryDate: new Date('2027-04-30'),
    phone: '085712345678',
    email: 'dimas.s@dentacare.id',
    address: 'Jl. Buah Batu No. 21, Bandung',
    username: 'ns.dimas',
    accessLevel: 'perawat',
    dutyDays: 'Setiap Hari Kerja',
    dutyTime: 'Shift Pagi (07:30 - 15:30)',
    status: 'aktif',
    isPic: false,
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC93RIU3WIQ3BmXWQ3By_ErVbX6GKxrARSbbP2ao3x3Kkm_OnyyzrG8rv7CSRUjruEqvTEd80KFB40s32njluyNEaLj4gog1yJXEi1eEmi4O1N8QxtOvhwnUuvnyPZAMlzQgSIDlbNK-rSsbk4oQva-OXqaQlFfYX5gKPyXbxz2qH60ps3ecVlUq-HPBuiB-u0itjz5kay6mmQmFUxxjgYk8iJ0Xskzw2dcnUuaGl4',
  },
  {
    medicalId: 'DC-NUR-002',
    fullName: 'Siti Nurhaliza, A.Md.KG',
    nik: '3271094311950005',
    birthDate: new Date('1995-11-03'),
    gender: 'P',
    employmentStatus: 'tetap',
    role: 'perawat',
    specialization: 'Skrining OHI-S & Edukasi',
    strNumber: '31.1.2.200.2.22.987654',
    strExpiryDate: new Date('2028-01-31'),
    phone: '087811223344',
    email: 'nurhaliza.siti@dentacare.id',
    address: 'Jl. Margacinta No. 7, Bandung',
    username: 'siti.nurhaliza',
    accessLevel: 'perawat',
    dutyDays: 'Setiap Hari Kerja',
    dutyTime: 'Shift Sore (13:30 - 20:30)',
    status: 'aktif',
    isPic: false,
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD34ZyytCwsX_I6g7n45_9Tj2aZiapUgKLpxdlfQMNwTgDZBeskWQHRxzOUJsJXz5Yk6HfOP5TVCtSoHIuNKEI5XQ7k-UaRZ2y_a1_hLutDArPcKqpF3AkRpTwNUY-qtSAGEvEW6vckIiPy7c3fs2Je-y4aO-rUBHH5cvS46BGIHJJbWTorVyKLIA62E4m3bNICIU5j_5LKXW4Y-7Qo5az9PVVqoe036WVEY8d-UlE',
  },
  {
    medicalId: 'DC-DOC-004',
    fullName: 'drg. Hendra Gunawan, Sp.Ort',
    nik: '3271012306850006',
    birthDate: new Date('1985-05-01'),
    gender: 'L',
    employmentStatus: 'mitra',
    role: 'spesialis',
    specialization: 'Ortodonsia (Sp.Ort)',
    strNumber: '31.2.1.100.1.17.321654',
    strExpiryDate: new Date('2026-12-31'),
    phone: '081244556677',
    email: 'hendra.g@dentacare.id',
    address: 'Jl. Ir. H. Juanda No. 99, Bandung',
    username: 'drg.hendra',
    accessLevel: 'dokter',
    dutyDays: 'Rabu & Sabtu',
    dutyTime: '10:00 - 17:00 WIB',
    status: 'aktif',
    isPic: false,
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC0i2jlgMPQ9-3JKoEADAV-_WnpfsKs7Tv7Z1fwici8buPDBIQHlplrFpib5tIx5AzU5hFeKXo38igOnkawU0x3jOiNehDj1_ueH8mbOwbznCJREJpZZYuc7RJFXtf990T58ZNv6-cxB7SGQVCrgFXAB_HqMnHYDkhCdcPbNtbZzeox5G_yLafDJeBI9cUvXqMXYJkNKitI2190sXnu9Cks6Qup2soiE15956TP1dg',
  },
  {
    medicalId: 'DC-DOC-005',
    fullName: 'drg. Bagus Nurhadi',
    nik: '3271120808840007',
    birthDate: new Date('1984-08-08'),
    gender: 'L',
    employmentStatus: 'mitra',
    role: 'umum',
    specialization: 'Restorasi & Gigi Anak',
    strNumber: '31.2.1.100.1.18.246810',
    strExpiryDate: new Date('2027-06-30'),
    phone: '081122334455',
    email: 'bagus.nurhadi@dentacare.id',
    address: 'Jl. Setiabudi No. 33, Bandung',
    username: 'drg.bagus',
    accessLevel: 'dokter',
    dutyDays: 'Senin, Selasa, Kamis',
    dutyTime: '14:00 - 20:00 WIB',
    status: 'cuti',
    isPic: false,
    avatarUrl: null,
  },
  {
    medicalId: 'DC-NUR-003',
    fullName: 'Ns. Ayu Kusuma Wardani, A.Md.KG',
    nik: '3271101709930008',
    birthDate: new Date('1993-10-17'),
    gender: 'P',
    employmentStatus: 'residen',
    role: 'perawat',
    specialization: 'Sterilisasi Instrumen & Asistensi',
    strNumber: '31.1.2.200.2.23.135790',
    strExpiryDate: new Date('2026-10-31'),
    phone: '089933445566',
    email: 'ayu.kusuma@dentacare.id',
    address: 'Jl. Soekarno-Hatta No. 120, Bandung',
    username: 'ns.ayu',
    accessLevel: 'perawat',
    dutyDays: 'Setiap Hari Kerja',
    dutyTime: 'Shift Pagi (07:30 - 15:30)',
    status: 'nonaktif',
    isPic: false,
    avatarUrl: null,
  },
] as const

type PatientVisitSeed = {
  visitDate: Date
  title: string
  clinicianName: string
  ohisScore: number | null
}

type PatientSeed = {
  medicalRecordNo: string
  nik: string
  fullName: string
  birthDate: Date
  gender: 'L' | 'P'
  bloodType: 'A' | 'B' | 'AB' | 'O' | null
  phone: string
  email: string | null
  address: string
  allergyAntibiotics: boolean
  hypertension: boolean
  diabetes: boolean
  ohisScore: number | null
  debrisIndex: number | null
  calculusIndex: number | null
  ohisCategory: 'baik' | 'sedang' | 'buruk' | null
  healthyTeeth: number
  odontogramNote: string | null
  dmftScore: number | null
  lastVisitAt: Date | null
  nextVisitAt: Date | null
  nextVisitClinician: string | null
  controlTitle: string | null
  controlNote: string | null
  controlPriority: 'normal' | 'urgent'
  visits: PatientVisitSeed[]
}

function tomorrowAt(hour: number, minute: number) {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(hour, minute, 0, 0)
  return date
}

function upcomingAt(days: number, hour: number, minute: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, minute, 0, 0)
  return date
}

const mockPatients: PatientSeed[] = [
  {
    medicalRecordNo: 'RM-2025-0148',
    nik: '32011458900123',
    fullName: 'Dian Restiana',
    birthDate: new Date(Date.UTC(1997, 2, 14)),
    gender: 'P',
    bloodType: 'B',
    phone: '081234567890',
    email: 'dian.restiana@mail.com',
    address: 'Jl. Merpati No. 12, Kebayoran Baru, Jakarta Selatan',
    allergyAntibiotics: false,
    hypertension: false,
    diabetes: false,
    ohisScore: 0.8,
    debrisIndex: 0.5,
    calculusIndex: 0.3,
    ohisCategory: 'baik',
    healthyTeeth: 29,
    odontogramNote: '2 Tambalan Komposit, 1 Sisa Akar (Gigi 46)',
    dmftScore: 3,
    lastVisitAt: new Date(Date.UTC(2025, 3, 10)),
    nextVisitAt: tomorrowAt(9, 30),
    nextVisitClinician: 'drg. Sarah Jenkins',
    controlTitle: null,
    controlNote: 'Kontrol Rutin OHI-S',
    controlPriority: 'normal',
    visits: [
      {
        visitDate: new Date(Date.UTC(2025, 3, 10)),
        title: 'Evaluasi Oral Hygiene & Pembersihan Debris',
        clinicianName: 'drg. Sarah Jenkins',
        ohisScore: 0.8,
      },
      {
        visitDate: new Date(Date.UTC(2025, 0, 15)),
        title: 'Penambalan Gigi 36 (Resin Komposit)',
        clinicianName: 'drg. Sarah Jenkins',
        ohisScore: null,
      },
    ],
  },
  {
    medicalRecordNo: 'RM-2025-0147',
    nik: '3273012106830004',
    fullName: 'Agus Wahyudi',
    birthDate: new Date(Date.UTC(1983, 5, 21)),
    gender: 'L',
    bloodType: 'A',
    phone: '081398765432',
    email: 'agus.wahyudi@mail.com',
    address: 'Jl. Anggrek No. 45, Bandung',
    allergyAntibiotics: false,
    hypertension: true,
    diabetes: false,
    ohisScore: 2.2,
    debrisIndex: 1.4,
    calculusIndex: 0.8,
    ohisCategory: 'sedang',
    healthyTeeth: 28,
    odontogramNote: '1 Karies Aktif (Gigi 16), 2 Tambalan',
    dmftScore: 4,
    lastVisitAt: new Date(Date.UTC(2025, 4, 26)),
    nextVisitAt: new Date(Date.UTC(2025, 4, 26)),
    nextVisitClinician: 'drg. Raditya Pratama',
    controlTitle: null,
    controlNote: 'Jadwal Evaluasi Plak',
    controlPriority: 'normal',
    visits: [
      {
        visitDate: new Date(Date.UTC(2025, 4, 26)),
        title: 'Evaluasi Plak & Skrining Kalkulus',
        clinicianName: 'drg. Raditya Pratama',
        ohisScore: 2.2,
      },
    ],
  },
  {
    medicalRecordNo: 'RM-2025-0146',
    nik: '3275054509960002',
    fullName: 'Siti Rahmawati',
    birthDate: new Date(Date.UTC(1996, 8, 5)),
    gender: 'P',
    bloodType: 'O',
    phone: '085712345678',
    email: 'siti.rahmawati@mail.com',
    address: 'Jl. Melati Blok C5, Bekasi',
    allergyAntibiotics: false,
    hypertension: false,
    diabetes: false,
    ohisScore: 0.6,
    debrisIndex: 0.4,
    calculusIndex: 0.2,
    ohisCategory: 'baik',
    healthyTeeth: 31,
    odontogramNote: '1 Tambalan Komposit (Gigi 26)',
    dmftScore: 1,
    lastVisitAt: new Date(Date.UTC(2025, 4, 23)),
    nextVisitAt: new Date(Date.UTC(2025, 4, 23)),
    nextVisitClinician: 'Ns. Dimas Setiawan',
    controlTitle: null,
    controlNote: 'Pemeriksaan Selesai',
    controlPriority: 'normal',
    visits: [
      {
        visitDate: new Date(Date.UTC(2025, 4, 23)),
        title: 'Pemeriksaan Rutin & Pencatatan OHI-S',
        clinicianName: 'Ns. Dimas Setiawan',
        ohisScore: 0.6,
      },
    ],
  },
  {
    medicalRecordNo: 'RM-2025-0145',
    nik: '3171021211790001',
    fullName: 'Hendra Pratama',
    birthDate: new Date(Date.UTC(1979, 10, 12)),
    gender: 'L',
    bloodType: 'AB',
    phone: '081122334455',
    email: 'hendra.pratama@mail.com',
    address: 'Jl. Diponegoro No. 88, Jakarta',
    allergyAntibiotics: true,
    hypertension: false,
    diabetes: false,
    ohisScore: 3.4,
    debrisIndex: 1.9,
    calculusIndex: 1.5,
    ohisCategory: 'buruk',
    healthyTeeth: 26,
    odontogramNote: '1 Sisa Akar (Gigi 36), 3 Karies Aktif',
    dmftScore: 6,
    lastVisitAt: null,
    nextVisitAt: null,
    nextVisitClinician: null,
    controlTitle: 'Jadwal Scaling',
    controlNote: 'Perlu Penanganan Cepat',
    controlPriority: 'urgent',
    visits: [
      {
        visitDate: new Date(Date.UTC(2025, 4, 12)),
        title: 'Skrining Kalkulus Berat & Rujukan Scaling',
        clinicianName: 'drg. Raditya Pratama',
        ohisScore: 3.4,
      },
    ],
  },
  {
    medicalRecordNo: 'RM-2025-0144',
    nik: '3671031802910003',
    fullName: 'Budi Santoso',
    birthDate: new Date(Date.UTC(1991, 1, 18)),
    gender: 'L',
    bloodType: 'O',
    phone: '081299887766',
    email: 'budi.santoso@mail.com',
    address: 'Jl. Kenanga No. 14, Tangerang',
    allergyAntibiotics: false,
    hypertension: false,
    diabetes: true,
    ohisScore: 1.4,
    debrisIndex: 0.9,
    calculusIndex: 0.5,
    ohisCategory: 'sedang',
    healthyTeeth: 30,
    odontogramNote: '2 Tambalan Komposit',
    dmftScore: 2,
    lastVisitAt: new Date(Date.UTC(2025, 4, 24)),
    nextVisitAt: new Date(Date.UTC(2025, 4, 24)),
    nextVisitClinician: 'drg. Sarah Jenkins',
    controlTitle: null,
    controlNote: 'Monitoring Pemulihan',
    controlPriority: 'normal',
    visits: [
      {
        visitDate: new Date(Date.UTC(2025, 4, 24)),
        title: 'Monitoring Pemulihan Gusi & OHI-S',
        clinicianName: 'drg. Sarah Jenkins',
        ohisScore: 1.4,
      },
    ],
  },
  {
    medicalRecordNo: 'RM-2025-0143',
    nik: '3173024301030005',
    fullName: 'Anita Lestari',
    birthDate: new Date(Date.UTC(2003, 0, 3)),
    gender: 'P',
    bloodType: 'A',
    phone: '087811223344',
    email: 'anita.lestari@mail.com',
    address: 'Jl. Cempaka Putih No. 9, Jakarta',
    allergyAntibiotics: false,
    hypertension: false,
    diabetes: false,
    ohisScore: 1.1,
    debrisIndex: 0.7,
    calculusIndex: 0.4,
    ohisCategory: 'baik',
    healthyTeeth: 32,
    odontogramNote: 'Gigi Sehat Tanpa Tambalan',
    dmftScore: 0,
    lastVisitAt: new Date(Date.UTC(2025, 4, 22)),
    nextVisitAt: new Date(Date.UTC(2025, 4, 22)),
    nextVisitClinician: 'Ns. Ayu Kusuma Wardani',
    controlTitle: null,
    controlNote: 'Selesai Edukasi Flossing',
    controlPriority: 'normal',
    visits: [
      {
        visitDate: new Date(Date.UTC(2025, 4, 22)),
        title: 'Edukasi Flossing & Pemeriksaan OHI-S',
        clinicianName: 'Ns. Ayu Kusuma Wardani',
        ohisScore: 1.1,
      },
    ],
  },
  {
    medicalRecordNo: 'RM-2025-0142',
    nik: '3276012907930006',
    fullName: 'M. Syahrul',
    birthDate: new Date(Date.UTC(1993, 6, 29)),
    gender: 'L',
    bloodType: 'B',
    phone: '085677889900',
    email: 'm.syahrul@mail.com',
    address: 'Jl. Gatot Subroto No. 31, Depok',
    allergyAntibiotics: false,
    hypertension: false,
    diabetes: false,
    ohisScore: 1.8,
    debrisIndex: 1.1,
    calculusIndex: 0.7,
    ohisCategory: 'sedang',
    healthyTeeth: 29,
    odontogramNote: '1 Tambalan, 1 Karies Awal (Gigi 47)',
    dmftScore: 3,
    lastVisitAt: new Date(Date.UTC(2025, 4, 27)),
    nextVisitAt: new Date(Date.UTC(2025, 4, 27)),
    nextVisitClinician: 'drg. Raditya Pratama',
    controlTitle: null,
    controlNote: 'Penilaian Kalkulus',
    controlPriority: 'normal',
    visits: [
      {
        visitDate: new Date(Date.UTC(2025, 4, 27)),
        title: 'Penilaian Kalkulus & Debris Index',
        clinicianName: 'drg. Raditya Pratama',
        ohisScore: 1.8,
      },
    ],
  },
  {
    medicalRecordNo: 'RM-2025-0141',
    nik: '3271045510850007',
    fullName: 'Ratna Dewi',
    birthDate: new Date(Date.UTC(1985, 9, 15)),
    gender: 'P',
    bloodType: 'O',
    phone: '081344556677',
    email: 'ratna.dewi@mail.com',
    address: 'Jl. Flamboyan No. 27, Bogor',
    allergyAntibiotics: false,
    hypertension: true,
    diabetes: false,
    ohisScore: 0.9,
    debrisIndex: 0.5,
    calculusIndex: 0.4,
    ohisCategory: 'baik',
    healthyTeeth: 30,
    odontogramNote: '1 Tambalan Amalgam (Gigi 37)',
    dmftScore: 2,
    lastVisitAt: new Date(Date.UTC(2025, 4, 19)),
    nextVisitAt: new Date(Date.UTC(2025, 4, 19)),
    nextVisitClinician: 'drg. Sarah Jenkins',
    controlTitle: null,
    controlNote: 'Selesai Kontrol',
    controlPriority: 'normal',
    visits: [
      {
        visitDate: new Date(Date.UTC(2025, 4, 19)),
        title: 'Kontrol Rutin & Evaluasi OHI-S',
        clinicianName: 'drg. Sarah Jenkins',
        ohisScore: 0.9,
      },
    ],
  },
]

const firstNames = [
  'Adi', 'Ayu', 'Bagas', 'Bella', 'Cahyo', 'Dian', 'Eka', 'Farah', 'Gilang', 'Hesti',
  'Ilham', 'Jihan', 'Krisna', 'Lina', 'Mega', 'Nanda', 'Oki', 'Putri', 'Rafi', 'Sari',
  'Teguh', 'Uma', 'Vino', 'Wulan', 'Yoga', 'Zahra', 'Arif', 'Bimo', 'Citra', 'Dimas',
  'Erna', 'Fajar', 'Gita', 'Rizal', 'Intan',
]
const lastNames = ['Pratama', 'Wijaya', 'Saputra', 'Halim', 'Nugroho', 'Kusuma', 'Santoso']
const streets = [
  'Jl. Merdeka No. 10', 'Jl. Sudirman No. 22', 'Jl. Ahmad Yani No. 7', 'Jl. Pahlawan No. 18',
  'Jl. Kartini No. 3', 'Jl. Gajah Mada No. 51', 'Jl. Beringin No. 9', 'Jl. Cendana No. 16',
]
const cities = ['Jakarta', 'Bandung', 'Bekasi', 'Tangerang', 'Depok', 'Bogor', 'Surabaya', 'Semarang']
const controlNotes = [
  'Kontrol Rutin OHI-S', 'Monitoring Pemulihan', 'Pemeriksaan Selesai',
  'Penilaian Kalkulus', 'Selesai Kontrol',
]
const visitTitles = [
  'Evaluasi Oral Hygiene & Pembersihan Debris',
  'Penilaian Kalkulus & Debris Index',
  'Pemeriksaan Rutin & Pencatatan OHI-S',
  'Edukasi Menyikat Gigi & Flossing',
  'Skrining Karies Awal',
]
const clinicians = [
  'drg. Sarah Jenkins', 'drg. Raditya Pratama', 'drg. Maya Anindita',
  'Ns. Dimas Setiawan', 'Ns. Ayu Kusuma Wardani',
]
const odontogramNotes = [
  'Gigi Sehat Tanpa Tambalan',
  '1 Tambalan Komposit',
  '2 Tambalan Komposit, 1 Karies Awal',
  '1 Karies Awal (Gigi 26)',
  '1 Sisa Akar (Gigi 46)',
]

function ohisCategoryOf(score: number): 'baik' | 'sedang' | 'buruk' {
  if (score <= 1.2)
    return 'baik'
  if (score <= 3)
    return 'sedang'
  return 'buruk'
}

function buildGeneratedPatients(total: number): PatientSeed[] {
  return Array.from({ length: total }, (_, index) => {
    const recordNumber = index + 1
    const year = 1958 + ((index * 7) % 48)
    const month = index % 12
    const day = (index % 27) + 1
    const score = Math.round((0.3 + ((index * 37) % 480) / 100) * 10) / 10
    const debris = Math.round(score * 6) / 10
    const calculus = Math.round((score - debris) * 10) / 10
    const urgent = index % 11 === 5
    const lastVisitAt = urgent ? null : new Date(Date.UTC(2025, 4, (index % 28) + 1))
    const visits: PatientVisitSeed[] = [
      {
        visitDate: new Date(Date.UTC(2025, 4, (index % 27) + 1)),
        title: visitTitles[index % visitTitles.length]!,
        clinicianName: clinicians[index % clinicians.length]!,
        ohisScore: score,
      },
    ]
    if (index % 4 === 0) {
      visits.push({
        visitDate: new Date(Date.UTC(2024, 10, (index % 25) + 1)),
        title: 'Pemeriksaan Awal & Pencatatan OHI-S',
        clinicianName: clinicians[(index + 2) % clinicians.length]!,
        ohisScore: Math.round(Math.min(score + 0.6, 5.5) * 10) / 10,
      })
    }

    return {
      medicalRecordNo: `RM-2025-${String(recordNumber).padStart(4, '0')}`,
      nik: `327102${String(day).padStart(2, '0')}${String(month + 1).padStart(2, '0')}${String(year).slice(-2)}${String(recordNumber).padStart(4, '0')}`,
      fullName: `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`,
      birthDate: new Date(Date.UTC(year, month, day)),
      gender: index % 2 === 0 ? 'P' : 'L',
      bloodType: (['A', 'B', 'AB', 'O'] as const)[index % 4]!,
      phone: `08${String(1200000000 + index * 7919).slice(-10)}`,
      email: `pasien${recordNumber}@mail.com`,
      address: `${streets[index % streets.length]}, ${cities[index % cities.length]}`,
      allergyAntibiotics: index % 13 === 0,
      hypertension: index % 9 === 0,
      diabetes: index % 17 === 0,
      ohisScore: score,
      debrisIndex: Math.min(debris, 3),
      calculusIndex: Math.max(calculus, 0),
      ohisCategory: ohisCategoryOf(score),
      healthyTeeth: 32 - (index % 9),
      odontogramNote: odontogramNotes[index % odontogramNotes.length]!,
      dmftScore: index % 7,
      lastVisitAt,
      nextVisitAt: urgent ? null : upcomingAt(index % 45, 8 + (index % 9), (index % 2) * 30),
      nextVisitClinician: urgent ? null : clinicians[index % clinicians.length]!,
      controlTitle: urgent ? 'Jadwal Scaling' : null,
      controlNote: urgent ? 'Perlu Penanganan Cepat' : controlNotes[index % controlNotes.length]!,
      controlPriority: urgent ? 'urgent' : 'normal',
      visits,
    }
  })
}

async function seedPatients() {
  const patients = [...mockPatients, ...buildGeneratedPatients(140)]
  let visitCount = 0

  for (const patient of patients) {
    const { visits, ...record } = patient
    const saved = await prisma.patient.upsert({
      where: { medicalRecordNo: record.medicalRecordNo },
      update: record,
      create: record,
    })
    await prisma.patientVisit.deleteMany({ where: { patientId: saved.id } })
    if (visits.length > 0) {
      await prisma.patientVisit.createMany({
        data: visits.map(visit => ({ ...visit, patientId: saved.id })),
      })
      visitCount += visits.length
    }
  }

  console.log(`Seeded ${patients.length} patients and ${visitCount} visits`)
}

const examinationSeed = {
  medicalRecordNo: 'RM-2025-0147',
  examinerMedicalId: 'DC-DOC-002',
  chiefComplaint:
    'Gusi sering berdarah saat menyikat gigi dan ngilu pada gigi posterior kanan atas saat minum dingin.',
  gingivaCondition: 'Gingivitis Marginal, edema ringan, BOP (Bleeding on Probing) (+)',
  mucosaCondition: 'Normal, Tidak ada lesi',
  prescriptionNote: 'Klorheksidin 0.12% bilas 2x1 sehari selama 7 hari.',
  hygieneDiagnosis:
    'Kalkulus derajat sedang dengan gingivitis lokal. Diindikasikan scaling & root planing serta profilaksis dental.',
  planOfAction: [
    'Scaling & Root Planing Rahang Atas & Bawah (Kode: DT-04)',
    'Edukasi Teknik Menyikat Gigi (Bass Technique & Dental Floss)',
  ],
  nextVisitNote: 'Evaluasi hasil scaling dan kontrol karies gigi 16.',
  teeth: [
    { fdiNumber: 16, condition: 'karies' as const, note: 'Karies klas I oklusal, rencana restorasi komposit' },
    { fdiNumber: 11, condition: 'tambalan' as const, note: 'Restorasi komposit servikal' },
    { fdiNumber: 36, condition: 'tambalan' as const, note: 'Restorasi amalgam stabil' },
    { fdiNumber: 48, condition: 'hilang' as const, note: 'Ekstraksi tahun 2023' },
  ],
  indexScores: [
    { fdiNumber: 16, surface: 'buccal' as const, debrisValue: 2, calculusValue: 2 },
    { fdiNumber: 11, surface: 'labial' as const, debrisValue: 1, calculusValue: 0 },
    { fdiNumber: 26, surface: 'buccal' as const, debrisValue: 1, calculusValue: 1 },
    { fdiNumber: 36, surface: 'lingual' as const, debrisValue: 2, calculusValue: 1 },
    { fdiNumber: 31, surface: 'labial' as const, debrisValue: 1, calculusValue: 0 },
    { fdiNumber: 46, surface: 'lingual' as const, debrisValue: 1, calculusValue: 1 },
  ],
}

function daysFromNow(days: number) {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() + days)
  return date
}

async function seedExamination() {
  const patient = await prisma.patient.findUnique({
    where: { medicalRecordNo: examinationSeed.medicalRecordNo },
    select: { id: true, fullName: true },
  })
  const examiner = await prisma.healthWorker.findUnique({
    where: { medicalId: examinationSeed.examinerMedicalId },
    select: { id: true, fullName: true, medicalId: true },
  })
  if (!patient || !examiner) {
    console.warn('Skip examination seed: patient or examiner not found')
    return
  }

  const debrisSum = examinationSeed.indexScores.reduce((total, row) => total + row.debrisValue, 0)
  const calculusSum = examinationSeed.indexScores.reduce((total, row) => total + row.calculusValue, 0)
  const debrisIndex = Math.round((debrisSum / 6) * 100) / 100
  const calculusIndex = Math.round((calculusSum / 6) * 100) / 100
  const ohisScore = Math.round((debrisIndex + calculusIndex) * 100) / 100
  const examDate = daysFromNow(-7)
  const nextVisitAt = daysFromNow(7)
  const allFdi = [
    ...[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
    ...[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
  ]
  const abnormal = new Map(examinationSeed.teeth.map(tooth => [tooth.fdiNumber, tooth]))
  const healthyTeeth = allFdi.length - abnormal.size
  const dmftScore = examinationSeed.teeth.filter(tooth => tooth.condition !== 'mahkota').length

  await prisma.examination.deleteMany({ where: { patientId: patient.id } })
  await prisma.examination.create({
    data: {
      patientId: patient.id,
      examinerId: examiner.id,
      examinerName: examiner.fullName,
      examDate,
      chiefComplaint: examinationSeed.chiefComplaint,
      bloodPressure: '128/82',
      heartRate: 78,
      heartRhythm: 'reguler',
      gingivaCondition: examinationSeed.gingivaCondition,
      mobilityDegree: 0,
      mucosaCondition: examinationSeed.mucosaCondition,
      prescriptionNote: examinationSeed.prescriptionNote,
      hygieneDiagnosis: examinationSeed.hygieneDiagnosis,
      planOfAction: examinationSeed.planOfAction,
      debrisIndex,
      calculusIndex,
      ohisScore,
      ohisCategory: ohisCategoryOf(ohisScore),
      healthyTeeth,
      dmftScore,
      status: 'final',
      nextVisitAt,
      nextVisitNote: examinationSeed.nextVisitNote,
      teeth: {
        create: allFdi.map(fdiNumber => ({
          fdiNumber,
          condition: abnormal.get(fdiNumber)?.condition ?? 'sehat',
          note: abnormal.get(fdiNumber)?.note ?? null,
        })),
      },
      indexScores: { create: examinationSeed.indexScores.map(row => ({ ...row })) },
    },
  })

  await prisma.patient.update({
    where: { id: patient.id },
    data: {
      ohisScore,
      debrisIndex,
      calculusIndex,
      ohisCategory: ohisCategoryOf(ohisScore),
      healthyTeeth,
      dmftScore,
      odontogramNote: `${examinationSeed.teeth.map(tooth => `${tooth.fdiNumber} ${tooth.condition}`).join(', ')} · OHI-S ${ohisScore.toFixed(2)}`.slice(0, 200),
      lastVisitAt: examDate,
      nextVisitAt,
      nextVisitClinician: examiner.fullName,
      controlTitle: 'Kontrol Hasil Pemeriksaan',
      controlNote: examinationSeed.nextVisitNote.slice(0, 120),
      controlPriority: ohisCategoryOf(ohisScore) === 'buruk' ? 'urgent' : 'normal',
    },
  })

  await prisma.patientVisit.create({
    data: {
      patientId: patient.id,
      visitDate: examDate,
      title: 'Pemeriksaan Gigi & Mulut',
      clinicianName: examiner.fullName,
      ohisScore,
    },
  })

  console.log(`Seeded examination for ${patient.fullName} (OHI-S ${ohisScore.toFixed(2)})`)
}

async function main() {
  await prisma.$transaction(
    staff.map((worker) =>
      prisma.healthWorker.upsert({
        where: { nik: worker.nik },
        update: { ...worker, passwordHash },
        create: { ...worker, passwordHash },
      }),
    ),
  )
  console.log(`Seeded ${staff.length} health workers`)
  await seedPatients()
  await seedExamination()
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
