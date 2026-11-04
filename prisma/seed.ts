import { PrismaClient } from '@prisma/client'
import { hashSync } from 'bcryptjs'
import { seedCareChecklist } from './seed-care'
import { seedPatientInbox } from './seed-patient-inbox'

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
    sipNumber: 'SIP-JKT-DKG-00421',
    sipIssuer: 'DPMPTSP DKI Jakarta',
    kkiNumber: '31092817',
    bio: 'Konservasi gigi fokus restorasi estetis dan perawatan saluran akar. Penanggung jawab modul monitoring kalkulus Klinik DentaCare.',
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
    sipNumber: 'SIP-SBY-DKG-01188',
    sipIssuer: 'DPMPTSP Kota Surabaya',
    kkiNumber: '32071104',
    bio: 'Spesialis periodonsia dengan fokus scaling & root planing, kuret, dan perawatan jaringan penyangga gigi.',
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
    sipNumber: 'SIP-BDG-DKG-02310',
    sipIssuer: 'DPMPTSP Kota Bandung',
    kkiNumber: '32104418',
    bio: 'Dokter gigi umum pelaksana pemeriksaan rutin, pencabihan sederhana, dan edukasi kebersihan gigi mulut pasien.',
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
    sipNumber: 'SIP-TER-NUR-04571',
    sipIssuer: 'DPMPTSP Kota Bandung',
    kkiNumber: 'B32107745',
    bio: 'Perawat gigi asistensi operatori, sterilisasi instrumen, dan pencatatan indeks OHI-S pasien baru.',
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
    sipNumber: 'SIP-TER-NUR-06288',
    sipIssuer: 'DPMPTSP Kota Bandung',
    kkiNumber: 'B32115320',
    bio: 'Perawat gigi skrining OHI-S, edukasi teknik menyikat gigi Bass, dan pendampingan kontrol pasien rutin.',
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
    sipNumber: 'SIP-JKT-DKG-00975',
    sipIssuer: 'DPMPTSP DKI Jakarta',
    kkiNumber: '31074418',
    bio: 'Spesialis ortodonsia untuk perawatan kawat gigi cekat dan removable serta perencanaan ortodontik.',
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
    sipNumber: 'SIP-BDG-DKG-03101',
    sipIssuer: 'DPMPTSP Kota Bandung',
    kkiNumber: '31082206',
    bio: 'Dokter gigi umum fokus restorasi dan perawatan gigi anak pada praktik paruh waktu.',
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
    sipNumber: 'SIP-TER-NUR-07744',
    sipIssuer: 'DPMPTSP Kota Bandung',
    kkiNumber: 'B32119802',
    bio: 'Residen perawat gigi dengan fokus sterilisasi instrumen dan asistensi shift pagi.',
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
  {
    medicalId: 'DC-ADM-001',
    fullName: 'Rina Kartika, A.Md.RMIK',
    nik: '3271011007900009',
    birthDate: new Date('1990-07-10'),
    gender: 'P',
    employmentStatus: 'tetap',
    role: 'umum',
    specialization: 'Rekam Medis & Administrasi Klinik',
    strNumber: '31.1.1.100.1.19.246801',
    strExpiryDate: new Date('2029-04-30'),
    sipNumber: 'SIP-ADM-01199',
    sipIssuer: 'Dinas Kesehatan Kota Bandung',
    kkiNumber: null,
    bio: 'Administrator klinik pengelola tarif, data pasien, dan konfigurasi sistem.',
    phone: '081122339900',
    email: 'admin.klinik@dentacare.id',
    address: 'Jl. Dago No. 45, Bandung',
    username: 'adm.klinik',
    accessLevel: 'admin',
    dutyDays: 'Senin - Jumat',
    dutyTime: 'Kantor (08:00 - 16:00)',
    status: 'aktif',
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
    const data = { ...record, passwordHash }
    const saved = await prisma.patient.upsert({
      where: { medicalRecordNo: record.medicalRecordNo },
      update: data,
      create: data,
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

/**
 * Data demo halaman /admin/dashboard: pemeriksaan final tersebar 6 bulan ke belakang supaya grafik
 * tren, donut OHI-S, dan tabel rekam terbaru punya angka nyata.
 *
 * Sengaja tidak menghapus apa pun: generator hanya mengisi sampai DEMO_EXAM_TOTAL, jadi
 * pemeriksaan yang dibuat manual lewat form tetap utuh dan `pnpm db:seed` boleh dijalankan berulang.
 * Ringkasan OHI-S pada tabel patients tidak disentuh — baris ini murni riwayat.
 */
const DEMO_EXAM_TOTAL = 60
/** Proporsi per bulan (indeks 0 = 5 bulan lalu). Salah satu bulan dibuat jadi puncak kurva. */
const DEMO_EXAM_MONTH_SHARES = [0.1, 0.14, 0.18, 0.26, 0.17, 0.15]
const DEMO_EXAM_COMPLAINTS = [
  'Gusi berdarah saat menyikat gigi sejak dua minggu terakhir',
  'Nyeri gigi posterior saat mengunyah makanan dingin',
  'Kontrol rutin dan permintaan pembersihan karang gigi',
  'Rasa tidak nyaman pada gigi depan bawah karena terasa ada endapan keras',
  'Ingin pembersihan karang gigi ringan sebelum aktivitas harian',
]
const DEMO_EXAM_GINGIVA = [
  'Gingiva merah muda dengan stiplining hilang ringan',
  'Edematous dan kemerahan pada marginal gingiva kuadran kiri bawah',
  'Gingiva pucat dengan resesi servikal ringan pada regio anterior',
  'Kondisi gingiva baik tanpa perdarahan probing',
]
const DEMO_EXAM_MUCOSA = ['Normal, Tidak ada lesi', 'Stomatitis ringan']
const DEMO_EXAM_FDI_POOL = [16, 26, 36, 46, 11, 31, 41, 14, 24]
const DEMO_SCALING_PLAN = 'Scaling & Root Planing Rahang Atas & Bawah (Kode: DT-04)'

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

function examDateInPastMonth(monthsAgo: number, day: number) {
  const anchor = new Date()
  // Tanggal bulan berjalan di-wrap ke rentang 1..hari ini supaya tetap tersebar, bukan menumpuk di hari ini.
  const safeDay = monthsAgo === 0 ? 1 + ((day - 1) % anchor.getUTCDate()) : day
  return new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - monthsAgo, safeDay))
}

function twoDecimals(value: number) {
  return Math.round(value * 100) / 100
}

function pickFrom<T>(list: readonly T[], rng: () => number): T {
  return list[Math.min(list.length - 1, Math.floor(rng() * list.length))] as T
}

/** Kombinasi debris/kalkulus yang dijaga tetap berada di dalam band OHI-S-nya. */
function examIndices(
  rng: () => number,
): { debrisIndex: number, calculusIndex: number, heavyCalculus: boolean } {
  const roll = rng()
  const category = roll < 0.58 ? 'baik' : roll < 0.84 ? 'sedang' : 'buruk'
  const heavyCalculus = category !== 'baik' && rng() < 0.42

  if (category === 'baik')
    return { debrisIndex: twoDecimals(0.2 + rng() * 0.4), calculusIndex: twoDecimals(0.1 + rng() * 0.45), heavyCalculus }

  if (category === 'sedang') {
    return heavyCalculus
      ? { debrisIndex: twoDecimals(0.1 + rng() * 0.3), calculusIndex: twoDecimals(2 + rng() * 0.6), heavyCalculus }
      : { debrisIndex: twoDecimals(0.8 + rng() * 0.7), calculusIndex: twoDecimals(0.6 + rng() * 0.8), heavyCalculus }
  }

  return heavyCalculus
    ? { debrisIndex: twoDecimals(1.7 + rng() * 0.9), calculusIndex: twoDecimals(2.4 + rng() * 1), heavyCalculus }
    : { debrisIndex: twoDecimals(1.7 + rng() * 0.9), calculusIndex: twoDecimals(1.6 + rng() * 0.8), heavyCalculus }
}

async function seedDashboardExaminations() {
  const existing = await prisma.examination.count({ where: { status: 'final' } })
  const needed = Math.max(0, DEMO_EXAM_TOTAL - existing)
  if (needed === 0) {
    console.log(`Seeded examinations already at ${existing} final records, nothing to add`)
    return
  }

  const patients = await prisma.patient.findMany({
    where: { medicalRecordNo: { not: examinationSeed.medicalRecordNo } },
    select: { id: true },
  })
  const examiners = await prisma.healthWorker.findMany({
    where: { status: 'aktif', role: { in: ['spesialis', 'umum', 'perawat'] } },
    select: { id: true, fullName: true },
  })
  if (patients.length === 0 || examiners.length === 0) {
    console.warn('Skip dashboard examination seed: no patients or active examiners')
    return
  }

  const rng = seededRandom(20_250_501)
  let created = 0

  for (const [monthIndex, share] of DEMO_EXAM_MONTH_SHARES.entries()) {
    const monthsAgo = DEMO_EXAM_MONTH_SHARES.length - 1 - monthIndex
    const planned = Math.min(Math.round(needed * share), needed - created)

    for (let row = 0; row < planned; row += 1) {
      const examiner = pickFrom(examiners, rng)
      const patientId = pickFrom(patients, rng).id
      const indices = examIndices(rng)
      const ohisScore = twoDecimals(indices.debrisIndex + indices.calculusIndex)
      const withScaling = rng() < 0.45
      const cariesCount = indices.heavyCalculus || rng() < 0.3 ? 1 + Math.floor(rng() * 4) : 0
      const cariesFdi = DEMO_EXAM_FDI_POOL.slice(0, cariesCount)
      const scheduled = rng() < 0.55

      await prisma.examination.create({
        data: {
          patientId,
          examinerId: examiner.id,
          examinerName: examiner.fullName,
          examDate: examDateInPastMonth(monthsAgo, 2 + (row % 24)),
          chiefComplaint: pickFrom(DEMO_EXAM_COMPLAINTS, rng),
          bloodPressure: `${110 + Math.floor(rng() * 20)}/${70 + Math.floor(rng() * 12)}`,
          heartRate: 68 + Math.floor(rng() * 20),
          gingivaCondition: pickFrom(DEMO_EXAM_GINGIVA, rng),
          mobilityDegree: indices.heavyCalculus ? 1 : 0,
          mucosaCondition: pickFrom(DEMO_EXAM_MUCOSA, rng),
          hygieneDiagnosis: `Kategori OHI-S ${ohisCategoryOf(ohisScore)} dengan indeks kalkulus ${indices.calculusIndex.toFixed(2)}`,
          prescriptionNote: 'Kontrol tiga bulan dengan evaluasi ulang indeks OHI-S',
          planOfAction: withScaling
            ? [DEMO_SCALING_PLAN, 'Edukasi Teknik Menyikat Gigi (Bass Technique & Dental Floss)']
            : ['Edukasi Teknik Menyikat Gigi (Bass Technique & Dental Floss)', 'Aplikasi Fluorid Vernis (Kode: DT-15)'],
          debrisIndex: indices.debrisIndex,
          calculusIndex: indices.calculusIndex,
          ohisScore,
          ohisCategory: ohisCategoryOf(ohisScore),
          healthyTeeth: 32 - cariesCount,
          dmftScore: cariesCount,
          status: 'final',
          nextVisitAt: scheduled ? daysFromNow(7 + Math.floor(rng() * 40)) : null,
          nextVisitNote: scheduled ? 'Kontrol hasil scaling dan evaluasi ulang indeks OHI-S' : null,
          teeth: {
            create: cariesFdi.map(fdiNumber => ({
              fdiNumber,
              condition: 'karies' as const,
              note: 'Lesi karies awal pada permukaan oklusal',
            })),
          },
        },
      })
      created += 1
    }
  }

  console.log(`Seeded ${created} additional final examinations for the dashboard`)
}

const MONITORING_TARGET = 76
const MONITORING_PROGRAMS = [
  'Program Pemantauan Periodontitis Kronis Ringan',
  'Program Pemantauan Pasca Scaling & Root Planing',
  'Program Pencegahan Karies & Aplikasi Fluor Topikal',
  'Program Edukasi Hygiene Oral Pasien Risiko Tinggi',
]
const MONITORING_PURPOSES = [
  'Evaluasi kalkulus subgingiva dan pengukuran ulang OHI-S',
  'Kontrol hasil scaling serta aplikasi fluoride varnish',
  'Edukasi ulang dental floss dan penilaian kepatuhan pasien',
  'Pemantauan poket periodontal pada kuadran posterior',
]
const MONITORING_VISIT_PREFIXES = ['Kunjungan ', 'Sesi Pemantauan ']
const MONITORING_DOCTOR_NOTES: Record<MonitoringStatusValue, string[]> = {
  terkontrol: [
    'Kepatuhan recall terjaga, pasien hadir tepat waktu pada tiga sesi terakhir. Edukasi hygiene oral dilanjutkan.',
    'Kondisi gingiva stabil tanpa tanda inflamasi baru. Interval pemantauan tiga bulan dipertahankan.',
    'Instruksi menyikat gigi dan dental floss dijalankan konsisten. Rencana kontrol berjalan sesuai program.',
  ],
  perlu_perhatian: [
    'Terdapat penumpukan kalkulus ringan pada servikal gigi anterior bawah. Dijadwalkan scaling profilaksis.',
    'Kebersihan mulut membaik sebagian, masih ada kuadran posterior dengan debris. Pengingat kontrol diperketat.',
    'Gusi masih mudah berdarah pada satu kuadran. Pasien perlu pendampingan teknik menyikat gigi.',
  ],
  terlambat: [
    'Pasien melewatkan sesi recall terakhir. Skor kebersihan belum bergerak, diperlukan pengingat aktif.',
    'Interval kontrol melebar sehingga penumpukan kalkulus meningkat. Recall segera dijadwalkan ulang.',
    'Kepatuhan menurun sejak pindah kerja. Rencana kontrol diulang dengan pengingat in-app.',
  ],
  kritis: [
    'Tanda inflamasi gingiva meningkat sejak kunjungan terakhir. Dirujuk untuk scaling bawah gingiva segera.',
    'Risiko gingivitis rekuren tinggi. Kepatuhan checklist rendah dan kontrol tertunda lama.',
    'Kondisi periodontal memburuk walau edukasi sudah diberikan. Intervensi profesional dan recall dipercepat.',
  ],
}
const MONITORING_VALIDATORS = [
  'drg. Sarah Jenkins, Sp.KG (SIP: 102/SIP-D/2021)',
  'drg. Raditya Pratama, Sp.Perio (SIP: 446/SIP-D/2022)',
  'drg. Maya Anindita (SIP: 218/SIP-D/2023)',
]

type MonitoringStatusValue = 'terkontrol' | 'perlu_perhatian' | 'terlambat' | 'kritis'
type MonitoringScorePair = { ohisScore: number, debrisIndex: number, calculusIndex: number }

const kritisIndexes = new Set([5, 23, 41, 67])
const terlambatIndexes = new Set([3, 11, 19, 27, 35, 43, 51, 59, 63, 71])
const perhatianIndexes = new Set([7, 13, 21, 29, 37, 45, 53, 61, 65, 69, 73, 75])

const featuredPrograms: Record<
  string,
  {
    status: MonitoringStatusValue
    programName: string
    checklistPercent: number
    baseline: MonitoringScorePair
    current: MonitoringScorePair
    doctorNote: string
    validatedByClinician: string
    scheduleOffsetDays: number
    scheduledVisitNote: string
    stages: {
      offsetMonths?: number
      offsetDays?: number
      day?: number
      title: string
      clinicianName: string
      ohisScore: number
      note: string
    }[]
  }
> = {
  'RM-2025-0145': {
    status: 'terkontrol',
    programName: 'Program Pemantauan Periodontitis Kronis Ringan',
    checklistPercent: 92,
    baseline: { ohisScore: 3.4, debrisIndex: 1.8, calculusIndex: 1.6 },
    current: { ohisScore: 1.2, debrisIndex: 0.6, calculusIndex: 0.6 },
    doctorNote:
      'Inflamasi gingiva tereduksi tuntas, kepatuhan sikat gigi teknik Bass memuaskan. Tidak ada poket aktif baru. Lanjutkan pemantauan interval 3 bulan.',
    validatedByClinician: 'drg. Raditya Pratama, Sp.Perio (SIP: 446/SIP-D/2022)',
    scheduleOffsetDays: 7,
    scheduledVisitNote: 'Evaluasi poket pasca-scaling dan perhitungan OHI-S kuadran 4',
    stages: [
      {
        offsetMonths: -6,
        day: 18,
        title: 'Kunjungan 1 (Bulan ke-1): Scaling Supragingiva & Pembersihan Awal',
        clinicianName: 'drg. Raditya Pratama, Sp.Perio',
        ohisScore: 3.4,
        note: 'Debris Index: 1.80, Calculus Index: 1.60. Pendarahan saat probing (BOP) pada region 31-41. Edukasi teknik menyikat gigi Bass modifikasi.',
      },
      {
        offsetMonths: -3,
        day: 20,
        title: 'Kunjungan 2 (Bulan ke-3): Scaling Subgingiva & Root Planing Evaluasi',
        clinicianName: 'drg. Raditya Pratama, Sp.Perio',
        ohisScore: 2.1,
        note: 'Reduksi poket periodontal dari 4mm menjadi 3mm. Penurunan kalkulus subgingiva 50%. Pasien konsisten memakai dental floss 1x sehari.',
      },
      {
        offsetDays: -14,
        title: 'Kunjungan 3 (Bulan ke-6): Pemeliharaan Berkala & Topikal Fluor',
        clinicianName: 'drg. Raditya Pratama, Sp.Perio',
        ohisScore: 1.2,
        note: 'Profilaksis dan poles akhir. Aplikasi varnish fluor untuk pencegahan karies sekunder. Kondisi gingiva kenyal, warna merah muda normal.',
      },
    ],
  },
  'RM-2025-0144': {
    status: 'perlu_perhatian',
    programName: 'Program Pemantauan Pasca Scaling & Root Planing',
    checklistPercent: 81,
    baseline: { ohisScore: 2.6, debrisIndex: 1.5, calculusIndex: 1.1 },
    current: { ohisScore: 1.4, debrisIndex: 0.9, calculusIndex: 0.5 },
    doctorNote:
      'Pasien diabetes terkontrol, penyembuhan gingiva melambat pada kuadran kiri bawah. Perlu pengingat kontrol agar interval tidak melebar.',
    validatedByClinician: 'drg. Sarah Jenkins, Sp.KG (SIP: 102/SIP-D/2021)',
    scheduleOffsetDays: 4,
    scheduledVisitNote: 'Kontrol gingiva kuadran 36-37 dan penyesuaian instruksi flossing',
    stages: [
      {
        offsetMonths: -5,
        day: 12,
        title: 'Kunjungan 1 (Bulan ke-1): Scaling & Pembersihan Karang Gigi',
        clinicianName: 'drg. Sarah Jenkins, Sp.KG',
        ohisScore: 2.6,
        note: 'Debris Index: 1.50, Calculus Index: 1.10. Educasi kontrol gula darah sebelum prosedur dan teknik menyikat gigi dua menit.',
      },
      {
        offsetMonths: -2,
        day: 9,
        title: 'Kunjungan 2 (Bulan ke-3): Evaluasi Penyembuhan Gingiva',
        clinicianName: 'drg. Sarah Jenkins, Sp.KG',
        ohisScore: 1.9,
        note: 'Edema gingiva berkurang signifikan, BOP tersisa pada region 36. Instruksi tambahan penggunaan interdental brush ukuran S.',
      },
      {
        offsetDays: -21,
        title: 'Kunjungan 3 (Bulan ke-5): Kontrol Berkala & Profilaksis',
        clinicianName: 'drg. Sarah Jenkins, Sp.KG',
        ohisScore: 1.4,
        note: 'Profilaksis paste pada kuadran 3 dan 4. Pasien melaporkan menyikat gigi 2x sehari dan flossing 4x seminggu.',
      },
    ],
  },
}

function roundSeed(value: number) {
  return Math.round(value * 100) / 100
}

function clampScore(value: number) {
  return roundSeed(Math.min(Math.max(value, 0), 3))
}

function scheduledAt(offsetDays: number, hour: number, minute: number) {
  const now = new Date()
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offsetDays, hour, minute),
  )
}

function visitedOn(offsetMonths?: number, offsetDays?: number, day = 12) {
  const now = new Date()
  if (offsetMonths !== undefined) {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offsetMonths, day))
  }
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + (offsetDays ?? 0)))
}

function statusForIndex(index: number): MonitoringStatusValue {
  if (kritisIndexes.has(index)) return 'kritis'
  if (terlambatIndexes.has(index)) return 'terlambat'
  if (perhatianIndexes.has(index)) return 'perlu_perhatian'
  return 'terkontrol'
}

function checklistForIndex(index: number, status: MonitoringStatusValue) {
  const ranges: Record<MonitoringStatusValue, [number, number]> = {
    terkontrol: [88, 100],
    perlu_perhatian: [78, 90],
    terlambat: [62, 78],
    kritis: [42, 58],
  }
  const [min, max] = ranges[status]
  return min + ((index * 7) % (max - min + 1))
}

function scheduleOffsetForIndex(index: number, status: MonitoringStatusValue) {
  if (status === 'terkontrol') return 3 + (index % 25)
  if (status === 'perlu_perhatian') return 1 + (index % 10)
  if (status === 'terlambat') return -(4 + (index % 40))
  return kritisIndexes.has(index) && index % 2 === 1 ? 0 : -(45 + (index % 60))
}

function baselineForIndex(index: number, status: MonitoringStatusValue, current: number) {
  if (status === 'kritis') return roundSeed(Math.max(0.2, current - 0.6))
  if (status === 'terlambat') return roundSeed(current)
  if (status === 'perlu_perhatian') return roundSeed(Math.min(current + 0.3 + (index % 2) * 0.3, 5))
  if (index % 4 === 0) return roundSeed(current)
  return roundSeed(Math.min(current + 0.6 + (index % 3) * 0.5, 5))
}

const DEMO_INBOX_MEDICAL_ID = 'DC-DOC-001'

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000)
}

function seedShortDate(value: Date | null) {
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

async function seedInbox(
  patients: { id: string, fullName: string }[],
  rows: { patientId: string, status: MonitoringStatusValue, scheduledVisitAt: Date | null, reminderSentAt: Date | null }[],
) {
  const recipient = await prisma.healthWorker.findUnique({
    where: { medicalId: DEMO_INBOX_MEDICAL_ID },
    select: { id: true },
  })
  if (!recipient) return

  const nameOf = new Map(patients.map(patient => [patient.id, patient.fullName]))
  const risky = rows.filter(row => row.status === 'terlambat' || row.status === 'kritis')
  const late = risky.filter(row => row.status === 'terlambat')
  const read = rows.filter(row => row.status === 'terkontrol' && row.scheduledVisitAt)
  const upcoming = read[0] ?? rows[0]
  const second = read[1] ?? rows[1]

  const inbox: {
    recipientId: string
    category: 'pengingat' | 'jadwal' | 'sistem'
    title: string
    body: string
    patientId?: string | null
    isRead: boolean
    createdAt: Date
    readAt?: Date | null
  }[] = []

  if (late[0]) {
    inbox.push({
      recipientId: recipient.id,
      category: 'pengingat',
      title: `Pengingat kontrol dikirim: ${nameOf.get(late[0].patientId) ?? 'pasien'}`,
      body: `Pengingat in-app terkirim untuk jadwal kontrol ${seedShortDate(late[0].scheduledVisitAt) ?? 'belum ditetapkan'}. Pasien diminta mengonfirmasi kehadiran.`,
      patientId: late[0].patientId,
      isRead: false,
      createdAt: minutesAgo(4),
    })
  }

  if (upcoming) {
    inbox.push({
      recipientId: recipient.id,
      category: 'jadwal',
      title: `Jadwal kontrol ${nameOf.get(upcoming.patientId) ?? 'pasien'} diperbarui`,
      body: `${seedShortDate(upcoming.scheduledVisitAt)} · pengingat in-app H-1 diaktifkan. Rencana kontrol sebelumnya pada rekam medis pasien otomatis digantikan.`,
      patientId: upcoming.patientId,
      isRead: false,
      createdAt: minutesAgo(38),
    })
  }

  inbox.push({
    recipientId: recipient.id,
    category: 'pengingat',
    title: `Blast pengingat in-app: ${risky.length} pasien`,
    body: `Pengingat kontrol dikirim ke ${risky.length} pasien berstatus terlambat dan kritis melalui kotak masuk in-app.`,
    isRead: false,
    createdAt: minutesAgo(95),
  })

  if (second) {
    const when = minutesAgo(60 * 20)
    inbox.push({
      recipientId: recipient.id,
      category: 'jadwal',
      title: `Jadwal kontrol ${nameOf.get(second.patientId) ?? 'pasien'} diperbarui`,
      body: `${seedShortDate(second.scheduledVisitAt)} · tanpa pengingat in-app. Pasien dijadwalkan ulang mengikuti ketersediaan dokter.`,
      patientId: second.patientId,
      isRead: true,
      createdAt: when,
      readAt: minutesAgo(60 * 19),
    })
  }

  const scaled = read.filter(row => row.reminderSentAt)[0] ?? rows[rows.length - 1]
  if (scaled) {
    const when = minutesAgo(60 * 30)
    inbox.push({
      recipientId: recipient.id,
      category: 'pengingat',
      title: `Pengingat kontrol dikirim: ${nameOf.get(scaled.patientId) ?? 'pasien'}`,
      body: `Pengingat in-app terkirim untuk jadwal kontrol ${seedShortDate(scaled.scheduledVisitAt) ?? 'belum ditetapkan'}. Konfirmasi kehadiran sudah diterima.`,
      patientId: scaled.patientId,
      isRead: true,
      createdAt: when,
      readAt: minutesAgo(60 * 28),
    })
  }

  inbox.push({
    recipientId: recipient.id,
    category: 'sistem',
    title: 'Rekap tren OHI-S program tersedia',
    body: 'Ringkasan rata-rata skor OHI-S enam bulan terakhir berhasil dihitung dari data kunjungan pemantauan.',
    isRead: true,
    createdAt: minutesAgo(60 * 52),
    readAt: minutesAgo(60 * 50),
  })

  await prisma.$transaction([
    prisma.notification.deleteMany({ where: { recipientId: recipient.id } }),
    prisma.notification.createMany({ data: inbox }),
  ])

  console.log(`Seeded ${inbox.length} in-app notifications (${inbox.filter(item => !item.isRead).length} belum dibaca)`)
}

async function seedMonitoring() {
  const patients = await prisma.patient.findMany({
    orderBy: { medicalRecordNo: 'desc' },
    select: {
      id: true,
      medicalRecordNo: true,
      fullName: true,
      ohisScore: true,
      debrisIndex: true,
      calculusIndex: true,
    },
    take: MONITORING_TARGET,
  })

  if (patients.length < MONITORING_TARGET) {
    console.warn(`Monitoring seed expects ${MONITORING_TARGET} patients, found ${patients.length}`)
  }
  if (patients.length === 0) return

  await prisma.patientVisit.deleteMany({
    where: {
      patientId: { in: patients.map(patient => patient.id) },
      OR: MONITORING_VISIT_PREFIXES.map(prefix => ({ title: { startsWith: prefix } })),
    },
  })

  const monitoringRows: {
    patientId: string
    programName: string
    status: MonitoringStatusValue
    checklistPercent: number
    baselineOhisScore: number
    baselineDebrisIndex: number
    baselineCalculusIndex: number
    scheduledVisitAt: Date | null
    scheduledVisitNote: string | null
    reminderConfirmed: boolean
    reminderSentAt: Date | null
    doctorNote: string | null
    validatedByClinician: string | null
  }[] = []
  const visitRows: {
    patientId: string
    visitDate: Date
    title: string
    clinicianName: string
    ohisScore: number
    note: string
  }[] = []

  for (const [index, patient] of patients.entries()) {
    const featured = featuredPrograms[patient.medicalRecordNo]
    const status = featured?.status ?? statusForIndex(index)
    const currentOhis = roundSeed(featured?.current.ohisScore ?? patient.ohisScore ?? 1.4)
    const currentDebris = featured?.current.debrisIndex ?? patient.debrisIndex ?? 0.8
    const currentCalculus = featured?.current.calculusIndex ?? patient.calculusIndex ?? 0.6
    const baselineOhis = featured?.baseline.ohisScore ?? baselineForIndex(index, status, currentOhis)
    const drift = status === 'kritis' ? -0.3 : status === 'terlambat' ? 0 : 0.4 + (index % 3) * 0.3
    const baselineDebris = featured
      ? featured.baseline.debrisIndex
      : clampScore(currentDebris + drift)
    const baselineCalculus = featured
      ? featured.baseline.calculusIndex
      : clampScore(currentCalculus + drift * 0.8)

    const offsetDays = featured
      ? featured.scheduleOffsetDays
      : scheduleOffsetForIndex(index, status)

    monitoringRows.push({
      patientId: patient.id,
      programName: featured?.programName ?? MONITORING_PROGRAMS[index % MONITORING_PROGRAMS.length]!,
      status,
      checklistPercent: featured?.checklistPercent ?? checklistForIndex(index, status),
      baselineOhisScore: roundSeed(baselineOhis),
      baselineDebrisIndex: baselineDebris,
      baselineCalculusIndex: baselineCalculus,
      scheduledVisitAt: offsetDays === 0 ? null : scheduledAt(offsetDays, 8 + (index % 9), (index % 2) * 30),
      scheduledVisitNote: featured?.scheduledVisitNote ?? MONITORING_PURPOSES[index % MONITORING_PURPOSES.length]!,
      reminderConfirmed: status === 'terkontrol' ? index % 3 !== 0 : status !== 'kritis',
      reminderSentAt:
        status === 'terlambat' || status === 'kritis'
          ? scheduledAt(-(2 + (index % 5)), 9, 0)
          : null,
      doctorNote: featured
        ? featured.doctorNote
        : MONITORING_DOCTOR_NOTES[status][index % MONITORING_DOCTOR_NOTES[status].length]!,
      validatedByClinician: featured
        ? featured.validatedByClinician
        : MONITORING_VALIDATORS[index % MONITORING_VALIDATORS.length]!,
    })

    if (featured) {
      for (const stage of featured.stages) {
        visitRows.push({
          patientId: patient.id,
          visitDate: visitedOn(stage.offsetMonths, stage.offsetDays, stage.day),
          title: stage.title,
          clinicianName: stage.clinicianName,
          ohisScore: stage.ohisScore,
          note: stage.note,
        })
      }
      await prisma.patient.update({
        where: { id: patient.id },
        data: {
          ohisScore: currentOhis,
          debrisIndex: currentDebris,
          calculusIndex: currentCalculus,
          ohisCategory: ohisCategoryOf(currentOhis),
          lastVisitAt: visitedOn(undefined, -14),
        },
      })
      continue
    }

    for (const monthsBack of [11, 10, 9, 8, 7, 6]) {
      visitRows.push({
        patientId: patient.id,
        visitDate: visitedOn(-monthsBack, undefined, (index % 24) + 3),
        title: 'Kunjungan Pemantauan Awal: Skrining OHI-S & Kalkulus',
        clinicianName: clinicians[(index + 1) % clinicians.length]!,
        ohisScore: Math.max(roundSeed(baselineOhis), 0.3),
        note: 'Pencatatan skor awal program pemantauan sebagai acuan tren perkembangan oral hygiene.',
      })
    }
    for (const [step, monthsBack] of [5, 4, 3, 2, 1].entries()) {
      const value = roundSeed(baselineOhis + ((currentOhis - baselineOhis) * (step + 1)) / 6)
      visitRows.push({
        patientId: patient.id,
        visitDate: visitedOn(-monthsBack, undefined, (index % 24) + 3),
        title: 'Kunjungan Pemantauan Berkala: Evaluasi OHI-S & Pembersihan',
        clinicianName: clinicians[index % clinicians.length]!,
        ohisScore: Math.max(value, 0.2),
        note: `Debris Index: ${baselineDebris.toFixed(2)}, Calculus Index: ${baselineCalculus.toFixed(2)}. Kontrol kebersihan mulut dievaluasi pada sesi rutin program.`,
      })
    }
    visitRows.push({
      patientId: patient.id,
      visitDate: visitedOn(undefined, -(2 + (index % 20))),
      title: 'Kunjungan Pemantauan Terkini: Kontrol Kepatuhan & Skor OHI-S',
      clinicianName: clinicians[(index + 2) % clinicians.length]!,
      ohisScore: currentOhis,
      note: `Skor terkini OHI-S ${currentOhis.toFixed(2)} dengan kategori ${ohisCategoryOf(currentOhis)}.`,
    })
  }

  await prisma.$transaction([
    prisma.patientMonitoring.deleteMany({ where: { patientId: { in: patients.map(p => p.id) } } }),
    prisma.patientMonitoring.createMany({ data: monitoringRows }),
    prisma.patientVisit.createMany({ data: visitRows }),
  ])

  console.log(
    `Seeded ${monitoringRows.length} monitoring programs and ${visitRows.length} monitoring visits`,
  )

  await seedInbox(
    patients.map(patient => ({ id: patient.id, fullName: patient.fullName })),
    monitoringRows.map(row => ({
      patientId: row.patientId,
      status: row.status,
      scheduledVisitAt: row.scheduledVisitAt,
      reminderSentAt: row.reminderSentAt,
    })),
  )
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
  await seedDashboardExaminations()
  await seedMonitoring()
  await seedCareChecklist(prisma)
  await seedPatientInbox(prisma)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
