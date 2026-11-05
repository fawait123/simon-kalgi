import type { Prisma, PrismaClient } from '@prisma/client'

/**
 * Seed materi edukasi kesehatan gigi (education_articles).
 * Dipanggil dari seed.ts setelah seedPatientRecord() — tidak bergantung relasi apa pun.
 * Upsert berdasarkan `title` yang unik supaya seed berulang tidak menduplikasi artikel.
 */

type ArticleDraft = {
  title: string
  excerpt: string
  body: string
  category: Prisma.EducationCategory
  format: Prisma.EducationFormat
  coverImageUrl: string | null
  readMinutes: number
  isPublished: boolean
  isFeatured: boolean
  viewCount: number
}

const articles: ArticleDraft[] = [
  {
    title: 'Teknik Menyikat Gigi yang Benar (Metode Bass)',
    excerpt:
      'Cara menyikat 2 menit dengan kemiringan 45 derajat ke garis gusi untuk mengangkat plak di celah antara gigi dan gusi.',
    body: `### Mengapa metode Bass?

Plak paling banyak menumpuk di **leher gigi dekat garis gusi**. Metode Bass (modified Bass) menempatkan bulu sikat tepat di celah itu sehingga pembersihannya maksimal tanpa melukai gusi.

### Langkah-langkah

1. Miringkan sikat **45 derajat** menghadap garis gusi.
2. Getarkan sikat pendek-pendek (2–3 gigi sekali gerak) selama 10–15 detik per regio.
3. Sapukan ke arah mahkota gigi (atas ke bawah, bawah ke atas).
4. Sikat permukaan kunyah dengan gerakan maju-mundur.
5. Untuk gigi depan bawah, tegakkan sikat dan gunakan ujung bulu sikat.
6. Tutup dengan menyikat lidah dan membersihkan celah dengan benang gigi.

### Tips penting

- Durasi minimal **2 menit**, dua kali sehari.
- Ganti sikat setiap 3 bulan atau saat bulu sudah mekar.
- Jangan menyikat terlalu keras — tekanan berlebih menyebabkan resesi gusi.`,
    category: 'menyikat',
    format: 'artikel',
    coverImageUrl: null,
    readMinutes: 5,
    isPublished: true,
    isFeatured: true,
    viewCount: 128,
  },
  {
    title: 'Panduan Flossing: Membersihkan Celah yang Tak Terjangkau Sikat',
    excerpt:
      'Sekitar 40 persen permukaan gigi berada di celah antar gigi. Benang gigi adalah satu-satunya alat yang bisa membersihkannya.',
    body: `### Kapan flossing dibutuhkan?

Sikat gigi hanya menjangkau 3 dari 5 permukaan gigi. Celah antar gigi tempat sisa makanan dan plak bersarang hanya bisa dibersihkan dengan **benang gigi (dental floss)** atau **interdental brush**.

### Cara flossing yang aman

1. Ambil benang sekitar 45 cm, lilitkan di jari tengah kedua tangan.
2. Regangkan 2–3 cm di antara jari telunjuk dan jempol.
3. Geser perlahan masuk ke celah — jangan "memotong" gusi.
4. Tekukkan benang membentuk huruf **C** mengelilingi sisi gigi.
5. Gerakkan naik-turun 2–3 kali, lalu ulangi di sisi gigi tetangga.
6. Lakukan di seluruh celah, termasuk gigi paling belakang.

### Catatan klinis

- Lakukan **sehari sekali**, idealnya sebelum menyikat pada malam hari.
- Gusi berdarah saat awal terbiasa adalah wajar; jika berlanjut lebih dari 2 minggu, konsultasikan ke dokter gigi.`,
    category: 'menyikat',
    format: 'video',
    coverImageUrl: null,
    readMinutes: 4,
    isPublished: true,
    isFeatured: false,
    viewCount: 86,
  },
  {
    title: 'Bahaya Tusuk Gigi Kayu dan Alternatif yang Aman',
    excerpt:
      'Mendorong bakteri ke dalam gusi dan memperlebar celah — alasan tusuk gigi kayu tidak disarankan pasca scaling.',
    body: `### Kenapa tusuk gigi kayu berisiko?

Pasca pembers karang gigi (scaling), dokter gigi biasanya melarang penggunaan tusuk gigi sementara waktu. Alasannya:

- **Ujung tajam** mendorong sisa makanan dan bakteri lebih dalam ke kantong gusi.
- Menyebabkan **trauma gusi**, perdarahan, dan memperlebar celah gigi permanen.
- Serpihan kayu bisa tertinggal di jaringan gusi dan memicu infeksi.

### Alternatif aman sesuai anjuran PDGI

| Alat | Kegunaan |
|---|---|
| Dental floss | Celah rapat antar gigi |
| Interdental brush | Celah lebar dan pasca perawatan periodontal |
| Water flosser | area sulit, pengguna kawat gigi |
| Sikat bulu lembut | Permukaan gigi dan gusi |

### Setelah scaling

- Boleh makan/minum setelah anestesi hilang (± 2 jam).
- Gigi sensitif 3–7 hari adalah normal; gunakan pasta desensitisasi.
- Kontrol ulang sesuai jadwal agar karang gigi tidak menumpuk lagi.`,
    category: 'kalkulus',
    format: 'artikel',
    coverImageUrl: null,
    readMinutes: 4,
    isPublished: true,
    isFeatured: true,
    viewCount: 214,
  },
  {
    title: 'Memahami Skor OHI-S: Indikator Kebersihan Mulut Anda',
    excerpt:
      'Oral Hygiene Index Simplified adalah rumus Green & Vermillion (DI-S + CI-S) yang dipakai klinik untuk memantau kebersihan gigi Anda.',
    body: `### Apa itu OHI-S?

**OHI-S (Oral Hygiene Index - Simplified)** mengukur dua hal:

1. **DI-S (Debris Index Simplified)** — tebal sisa makanan/plak yang menempel.
2. **CI-S (Calculus Index Simplified)** — keberadaan karang gigi.

Skor tiap indeks 0–3, dijumlahkan sehingga total OHI-S berkisar **0–6**. Semakin kecil, semakin bersih.

### Kategori hasil

| Skor | Kategori | Arti klinis |
|---|---|---|
| 0,0 – 1,2 | Baik | Kebersihan terjaga, pertahankan rutinitas |
| 1,31 – 1,5 | Sedang | Plak mulai menumpuk, evaluasi teknik sikat |
| > 1,5 | Kurang | Perlu pembersihan profesional dan edukasi ulang |

### Cara meningkatkan skor

- Menyikat 2 menit, 2 kali sehari dengan metode Bass.
- Flossing harian.
- Scaling tiap 6 bulan.
- Kurangi makanan lengket dan manis di antara waktu makan.`,
    category: 'kalkulus',
    format: 'checklist',
    coverImageUrl: null,
    readMinutes: 6,
    isPublished: true,
    isFeatured: false,
    viewCount: 173,
  },
  {
    title: 'Perawatan Gusi Periodontal: Tanda Awal dan Cara Mencegahnya',
    excerpt:
      'Gusi berdarah bukan hal sepele — kenali tahapan dari gingivitis hingga periodontitis sebelum gigi goyang.',
    body: `### Mengenali masalah gusi

**Gingivitis** (tahap awal):

- Gusi merah, bengkak, mudah berdarah saat sikat gigi.
- Masih bisa pulih total dengan kebersihan mulut yang baik.

**Periodontitis** (lanjutan):

- Kantong gusi terbentuk, tulang penyangga gigi rusak.
- Gigi terasa goyang, jarak antar gigi melebar, napas tak sedap menetap.
- Tidak dapat pulih sendiri — butuh perawatan kuretase (scaling & root planing).

### Faktor risiko

- Merokok (risiko tertinggi)
- Diabetes yang tidak terkontrol
- Kehamilan dan perubahan hormonal
- Gigi tirapi atau tambalan yang tidak pas

### Pencegahan

1. Kontrol 6 bulan sekali untuk deteksi dini kantong gusi.
2. Sikat + flossing setiap hari.
3. Segera lapor bila perdarahan gusi berlangsung lebih dari 2 minggu.`,
    category: 'gusi',
    format: 'artikel',
    coverImageUrl: null,
    readMinutes: 5,
    isPublished: true,
    isFeatured: false,
    viewCount: 92,
  },
  {
    title: 'Pola Makan Sehat Gigi: Mana yang Melindungi, Mana yang Mengikis',
    excerpt:
      'Frekuensi gula lebih berbahaya daripada jumlahnya. Panduan memilih camilan dan minuman untuk enamel.',
    body: `### Musuh enamel: asam dan gula

Setiap kali Anda mengonsumsi gula, bakteri di plak memproduksi asam selama **20–30 menit** yang menurunkan pH mulut dan melarutkan mineral enamel. Semakin sering ngemil manis, semakin lama enamel berada di zona asam.

### Pilihan lebih baik

- **Air putih** setelah makan — menetralkan pH paling cepat.
- **Keju dan yoghurt tanpa gula** — kalsium dan protein membantu remineralisasi.
- **Buah potong renyah** (apel, pir) — merangsang air liur.
- **Kacang-kacangan** — lemak sehat, minim gula lengket.

### Batasi / hindari

- Permen kunyah dan karamel (lengket menempel di fisura gigi).
- Minuman bersoda dan teh manis kemasan (asam + gula ganda).
- Ngemil manis berulang di antara jam makan.

### Waktu makan

Lebih aman menikmati makanan manis **bersamaan** dengan makan besar daripada mengudapnya terpisah — jumlah paparan asam per hari lebih sedikit.`,
    category: 'diet',
    format: 'artikel',
    coverImageUrl: null,
    readMinutes: 4,
    isPublished: true,
    isFeatured: false,
    viewCount: 57,
  },
  {
    title: 'Sensitif Setelah Scaling: Penyebab dan Cara Mengatasinya',
    excerpt:
      'Dingin dan manis terasa ngilu beberapa hari pasca pembers karang? Ini penjelasan dan cara menenangkannya.',
    body: `### Mengapa ngilu pasca scaling?

Karang gigi yang menempel selama ini "menutupi" leher gigi yang mulai terekspos. Setelah dibersihkan, permukaan akar yang terbuka langsung berkontak dengan rangsang panas, dingin, dan manis. Kondisi ini **normal berlangsung 3–7 hari**.

### Yang bisa dilakukan

1. Pakai pasta gigi **desensitisasi** (mengandung kalium nitrat atau stannous fluoride) 2 kali sehari.
2. Hindari makanan/minuman sangat dingin atau asam 2–3 hari pertama.
3. Sikat dengan bulu **soft** dan tekanan ringan.
4. Jangan mengunyah permen asam di area yang sensitif.

### Kapan harus kembali ke dokter gigi?

- Ngilu tidak membaik setelah 2 minggu.
- Nyeri berdenyut atau bengkak — bisa jadi ada penyebab lain (gigi retak, pulpa meradang).
- Perdarahan gusi yang tidak berhenti.`,
    category: 'gusi',
    format: 'artikel',
    coverImageUrl: null,
    readMinutes: 3,
    isPublished: true,
    isFeatured: false,
    viewCount: 41,
  },
  {
    title: 'Tanya Jawab: Seberapa Sering Kontrol ke Dokter Gigi?',
    excerpt:
      'Jawaban singkat untuk pertanyaan paling sering: interval kontrol, alasan scaling, dan mitos menyikat gigi keras.',
    body: `### Q: Harus kontrol tiap 6 bulan?

**Ya** untuk pasien dengan kebersihan baik. Pasien periodontitis, perokok, atau pengguna kawat gigi biasanya direcall **tiap 3 bulan** sesuai rencana DPJP.

### Q: Scaling bikin gigi renggang?

**Mitos.** Yang membuat renggang adalah karang gigi dan kerusakan tulang yang dibiarkan. Scaling justru mengembalikan posisi gusi ke kondisi sedekat mungkin dengan alami.

### Q: Menyikat makin keras makin bersih?

**Salah.** Tekanan berlebih merusak leher gigi (abfraksi) dan menarik gusi turun. Getaran kecil dengan bulu lembut jauh lebih efektif mengangkat plak.

### Q: Berapa lama efek fluoride varnish?

Fluoride topeng Profesional di klinik memperkuat enamel selama beberapa bulan; tetap butuh pasta gigi berfluorida di rumah sebagai pelindung harian.

### Q: Napas badu selalu dari lambung?

80 persen kasus sumbernya **rongga mulut**: plak lidah, karang gigi, atau kantong gusi. Baru setelah gigi sehat bersih, pertimbangkan penyebab lain.`,
    category: 'faq',
    format: 'artikel',
    coverImageUrl: null,
    readMinutes: 3,
    isPublished: true,
    isFeatured: false,
    viewCount: 66,
  },
  {
    title: 'Kawat Gigi: Checklist Perawatan Harian (Draf)',
    excerpt:
      'Daftar periksa harian untuk pengguna behel — dari sikat interdental hingga wax ortodontik.',
    body: `### Checklist harian

- [ ] Sikat brackets 45 derajat dari atas dan bawah
- [ ] Interdental brush di bawah kawat
- [ ] Floss threader seminggu sekali
- [ ] Bilas water flosser malam hari
- [ ] Periksa wax di titik yang menggesek pipi

> Draf ini belum dipublikasikan — dipakai untuk menguji status draf di halaman kelola admin.`,
    category: 'menyikat',
    format: 'checklist',
    coverImageUrl: null,
    readMinutes: 2,
    isPublished: false,
    isFeatured: false,
    viewCount: 0,
  },
]

export async function seedEducationArticles(prisma: PrismaClient) {
  let created = 0
  for (const article of articles) {
    const existing = await prisma.educationArticle.findUnique({
      where: { title: article.title },
      select: { id: true },
    })
    if (existing) {
      await prisma.educationArticle.update({
        where: { id: existing.id },
        data: article,
      })
    }
    else {
      await prisma.educationArticle.create({ data: article })
      created += 1
    }
  }
  console.log(`Seeded ${articles.length} education articles (${created} new).`)
}
