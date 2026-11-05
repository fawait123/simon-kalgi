import type { Prisma, PrismaClient } from '@prisma/client'

/**
 * Seed materi edukasi kesehatan gigi (education_articles).
 * Dipanggil dari seed.ts setelah seedPatientRecord() — tidak bergantung relasi apa pun.
 * Body disimpan sebagai HTML (hasil WYSIWYG editor admin) dan dirender sanitized di portal pasien.
 * Seed ini membuang seluruh artikel lama lalu membuat ulang — data hasil kreasi admin ikut terhapus.
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
    body: `<h2>Mengapa metode Bass?</h2>
<p>Plak paling banyak menumpuk di <strong>leher gigi dekat garis gusi</strong>. Metode Bass (modified Bass) menempatkan bulu sikat tepat di celah itu sehingga pembersihannya maksimal tanpa melukai gusi.</p>
<h2>Langkah-langkah</h2>
<ol>
<li>Miringkan sikat <strong>45 derajat</strong> menghadap garis gusi.</li>
<li>Getarkan sikat pendek-pendek (2–3 gigi sekali gerak) selama 10–15 detik per regio.</li>
<li>Sapukan ke arah mahkota gigi (atas ke bawah, bawah ke atas).</li>
<li>Sikat permukaan kunyah dengan gerakan maju-mundur.</li>
<li>Untuk gigi depan bawah, tegakkan sikat dan gunakan ujung bulu sikat.</li>
<li>Tutup dengan menyikat lidah dan membersihkan celah dengan benang gigi.</li>
</ol>
<h2>Tips penting</h2>
<ul>
<li>Durasi minimal <strong>2 menit</strong>, dua kali sehari.</li>
<li>Ganti sikat setiap 3 bulan atau saat bulu sudah mekar.</li>
<li>Jangan menyikat terlalu keras — tekanan berlebih menyebabkan resesi gusi.</li>
</ul>`,
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
    body: `<h2>Kapan flossing dibutuhkan?</h2>
<p>Sikat gigi hanya menjangkau 3 dari 5 permukaan gigi. Celah antar gigi tempat sisa makanan dan plak bersarang hanya bisa dibersihkan dengan <strong>benang gigi (dental floss)</strong> atau <strong>interdental brush</strong>.</p>
<h2>Cara flossing yang aman</h2>
<ol>
<li>Ambil benang sekitar 45 cm, lilitkan di jari tengah kedua tangan.</li>
<li>Regangkan 2–3 cm di antara jari telunjuk dan jempol.</li>
<li>Geser perlahan masuk ke celah — jangan "memotong" gusi.</li>
<li>Tekukkan benang membentuk huruf <strong>C</strong> mengelilingi sisi gigi.</li>
<li>Gerakkan naik-turun 2–3 kali, lalu ulangi di sisi gigi tetangga.</li>
<li>Lakukan di seluruh celah, termasuk gigi paling belakang.</li>
</ol>
<h2>Catatan klinis</h2>
<ul>
<li>Lakukan <strong>sehari sekali</strong>, idealnya sebelum menyikat pada malam hari.</li>
<li>Gusi berdarah saat awal terbiasa adalah wajar; jika berlanjut lebih dari 2 minggu, konsultasikan ke dokter gigi.</li>
</ul>`,
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
    body: `<h2>Kenapa tusuk gigi kayu berisiko?</h2>
<p>Pasca pembers karang gigi (scaling), dokter gigi biasanya melarang penggunaan tusuk gigi sementara waktu. Alasannya:</p>
<ul>
<li><strong>Ujung tajam</strong> mendorong sisa makanan dan bakteri lebih dalam ke kantong gusi.</li>
<li>Menyebabkan <strong>trauma gusi</strong>, perdarahan, dan memperlebar celah gigi permanen.</li>
<li>Serpihan kayu bisa tertinggal di jaringan gusi dan memicu infeksi.</li>
</ul>
<h2>Alternatif aman sesuai anjuran PDGI</h2>
<table>
<thead>
<tr><th>Alat</th><th>Kegunaan</th></tr>
</thead>
<tbody>
<tr><td>Dental floss</td><td>Celah rapat antar gigi</td></tr>
<tr><td>Interdental brush</td><td>Celah lebar dan pasca perawatan periodontal</td></tr>
<tr><td>Water flosser</td><td>Area sulit, pengguna kawat gigi</td></tr>
<tr><td>Sikat bulu lembut</td><td>Permukaan gigi dan gusi</td></tr>
</tbody>
</table>
<h2>Setelah scaling</h2>
<ul>
<li>Boleh makan/minum setelah anestesi hilang (± 2 jam).</li>
<li>Gigi sensitif 3–7 hari adalah normal; gunakan pasta desensitisasi.</li>
<li>Kontrol ulang sesuai jadwal agar karang gigi tidak menumpuk lagi.</li>
</ul>`,
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
    body: `<h2>Apa itu OHI-S?</h2>
<p><strong>OHI-S (Oral Hygiene Index - Simplified)</strong> mengukur dua hal:</p>
<ol>
<li><strong>DI-S (Debris Index Simplified)</strong> — tebal sisa makanan/plak yang menempel.</li>
<li><strong>CI-S (Calculus Index Simplified)</strong> — keberadaan karang gigi.</li>
</ol>
<p>Skor tiap indeks 0–3, dijumlahkan sehingga total OHI-S berkisar <strong>0–6</strong>. Semakin kecil, semakin bersih.</p>
<h2>Kategori hasil</h2>
<table>
<thead>
<tr><th>Skor</th><th>Kategori</th><th>Arti klinis</th></tr>
</thead>
<tbody>
<tr><td>0,0 – 1,2</td><td>Baik</td><td>Kebersihan terjaga, pertahankan rutinitas</td></tr>
<tr><td>1,31 – 1,5</td><td>Sedang</td><td>Plak mulai menumpuk, evaluasi teknik sikat</td></tr>
<tr><td>&gt; 1,5</td><td>Kurang</td><td>Perlu pembersihan profesional dan edukasi ulang</td></tr>
</tbody>
</table>
<h2>Cara meningkatkan skor</h2>
<ul>
<li>Menyikat 2 menit, 2 kali sehari dengan metode Bass.</li>
<li>Flossing harian.</li>
<li>Scaling tiap 6 bulan.</li>
<li>Kurangi makanan lengket dan manis di antara waktu makan.</li>
</ul>`,
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
    body: `<h2>Mengenali masalah gusi</h2>
<p><strong>Gingivitis</strong> (tahap awal):</p>
<ul>
<li>Gusi merah, bengkak, mudah berdarah saat sikat gigi.</li>
<li>Masih bisa pulih total dengan kebersihan mulut yang baik.</li>
</ul>
<p><strong>Periodontitis</strong> (lanjutan):</p>
<ul>
<li>Kantong gusi terbentuk, tulang penyangga gigi rusak.</li>
<li>Gigi terasa goyang, jarak antar gigi melebar, napas tak sedap menetap.</li>
<li>Tidak dapat pulih sendiri — butuh perawatan kuretase (scaling &amp; root planing).</li>
</ul>
<h2>Faktor risiko</h2>
<ul>
<li>Merokok (risiko tertinggi)</li>
<li>Diabetes yang tidak terkontrol</li>
<li>Kehamilan dan perubahan hormonal</li>
<li>Gigi tirapi atau tambalan yang tidak pas</li>
</ul>
<h2>Pencegahan</h2>
<ol>
<li>Kontrol 6 bulan sekali untuk deteksi dini kantong gusi.</li>
<li>Sikat + flossing setiap hari.</li>
<li>Segera lapor bila perdarahan gusi berlangsung lebih dari 2 minggu.</li>
</ol>`,
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
    body: `<h2>Musuh enamel: asam dan gula</h2>
<p>Setiap kali Anda mengonsumsi gula, bakteri di plak memproduksi asam selama <strong>20–30 menit</strong> yang menurunkan pH mulut dan melarutkan mineral enamel. Semakin sering ngemil manis, semakin lama enamel berada di zona asam.</p>
<h2>Pilihan lebih baik</h2>
<ul>
<li><strong>Air putih</strong> setelah makan — menetralkan pH paling cepat.</li>
<li><strong>Keju dan yoghurt tanpa gula</strong> — kalsium dan protein membantu remineralisasi.</li>
<li><strong>Buah potong renyah</strong> (apel, pir) — merangsang air liur.</li>
<li><strong>Kacang-kacangan</strong> — lemak sehat, minim gula lengket.</li>
</ul>
<h2>Batasi / hindari</h2>
<ul>
<li>Permen kunyah dan karamel (lengket menempel di fisura gigi).</li>
<li>Minuman bersoda dan teh manis kemasan (asam + gula ganda).</li>
<li>Ngemil manis berulang di antara jam makan.</li>
</ul>
<h2>Waktu makan</h2>
<p>Lebih aman menikmati makanan manis <strong>bersamaan</strong> dengan makan besar daripada mengudapnya terpisah — jumlah paparan asam per hari lebih sedikit.</p>`,
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
    body: `<h2>Mengapa ngilu pasca scaling?</h2>
<p>Karang gigi yang menempel selama ini "menutupi" leher gigi yang mulai terekspos. Setelah dibersihkan, permukaan akar yang terbuka langsung berkontak dengan rangsang panas, dingin, dan manis. Kondisi ini <strong>normal berlangsung 3–7 hari</strong>.</p>
<h2>Yang bisa dilakukan</h2>
<ol>
<li>Pakai pasta gigi <strong>desensitisasi</strong> (mengandung kalium nitrat atau stannous fluoride) 2 kali sehari.</li>
<li>Hindari makanan/minuman sangat dingin atau asam 2–3 hari pertama.</li>
<li>Sikat dengan bulu <strong>soft</strong> dan tekanan ringan.</li>
<li>Jangan mengunyah permen asam di area yang sensitif.</li>
</ol>
<h2>Kapan harus kembali ke dokter gigi?</h2>
<ul>
<li>Ngilu tidak membaik setelah 2 minggu.</li>
<li>Nyeri berdenyut atau bengkak — bisa jadi ada penyebab lain (gigi retak, pulpa meradang).</li>
<li>Perdarahan gusi yang tidak berhenti.</li>
</ul>`,
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
    body: `<h2>Q: Harus kontrol tiap 6 bulan?</h2>
<p><strong>Ya</strong> untuk pasien dengan kebersihan baik. Pasien periodontitis, perokok, atau pengguna kawat gigi biasanya direcall <strong>tiap 3 bulan</strong> sesuai rencana DPJP.</p>
<h2>Q: Scaling bikin gigi renggang?</h2>
<p><strong>Mitos.</strong> Yang membuat renggang adalah karang gigi dan kerusakan tulang yang dibiarkan. Scaling justru mengembalikan posisi gusi ke kondisi sedekat mungkin dengan alami.</p>
<h2>Q: Menyikat makin keras makin bersih?</h2>
<p><strong>Salah.</strong> Tekanan berlebih merusak leher gigi (abfraksi) dan menarik gusi turun. Getaran kecil dengan bulu lembut jauh lebih efektif mengangkat plak.</p>
<h2>Q: Berapa lama efek fluoride varnish?</h2>
<p>Fluoride topeng profesional di klinik memperkuat enamel selama beberapa bulan; tetap butuh pasta gigi berfluorida di rumah sebagai pelindung harian.</p>
<h2>Q: Napas badu selalu dari lambung?</h2>
<p>80 persen kasus sumbernya <strong>rongga mulut</strong>: plak lidah, karang gigi, atau kantong gusi. Baru setelah gigi sehat bersih, pertimbangkan penyebab lain.</p>`,
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
    body: `<h2>Checklist harian</h2>
<ul>
<li>Sikat brackets 45 derajat dari atas dan bawah</li>
<li>Interdental brush di bawah kawat</li>
<li>Floss threader seminggu sekali</li>
<li>Bilas water flosser malam hari</li>
<li>Periksa wax di titik yang menggesek pipi</li>
</ul>
<blockquote><p>Draf ini belum dipublikasikan — dipakai untuk menguji status draf di halaman kelola admin.</p></blockquote>`,
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
  await prisma.educationArticle.deleteMany()
  await prisma.educationArticle.createMany({ data: articles })
  console.log(`Seeded ${articles.length} education articles (HTML bodies).`)
}
