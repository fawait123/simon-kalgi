import type { ExaminationDetailDto } from '~~/shared/types/examination'
import {
  formatScore,
  surfaceLabel,
  toothConditionLabel,
  toothNameOf,
} from '~~/shared/types/examination'
import { genderLabel, ohisCategoryLabel } from '~~/shared/types/patient'
import { calcAge, formatDateId } from './format'

function esc(value: string | number | null | undefined) {
  return String(value ?? '-')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function row(label: string, value: string) {
  return `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`
}

function indexRows(exam: ExaminationDetailDto) {
  if (exam.indexScores.length === 0)
    return '<tr><td colspan="4">Belum ada penilaian indeks tercatat.</td></tr>'
  return exam.indexScores
    .map(score => `<tr>
      <td>${score.fdiNumber}</td>
      <td>${esc(toothNameOf(score.fdiNumber))}</td>
      <td>${esc(surfaceLabel[score.surface])}</td>
      <td>${score.debrisValue} / ${score.calculusValue}</td>
    </tr>`)
    .join('')
}

function toothRows(exam: ExaminationDetailDto) {
  if (exam.teeth.length === 0)
    return '<tr><td colspan="3">Odontogram belum diisi.</td></tr>'
  return exam.teeth
    .map(tooth => `<tr>
      <td>${tooth.fdiNumber}</td>
      <td>${esc(toothConditionLabel[tooth.condition])}</td>
      <td>${esc(tooth.note)}</td>
    </tr>`)
    .join('')
}

const STYLES = `
  @page { margin: 18mm; }
  body { font: 12px/1.5 'Inter', system-ui, sans-serif; color: #0f172a; }
  h1 { font-size: 17px; margin: 0 0 2px; }
  h2 { font-size: 13px; margin: 20px 0 6px; text-transform: uppercase; letter-spacing: .04em; color: #475569; }
  .sub { color: #475569; font-size: 11px; margin: 0 0 14px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 5px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  thead th { background: #eff4ff; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
  tbody th { width: 190px; font-weight: 600; color: #475569; }
  .score { display: flex; gap: 24px; margin: 6px 0 0; font-size: 12px; }
  .score b { font-size: 16px; }
  .sign { margin-top: 28px; display: flex; justify-content: flex-end; }
  .sign div { width: 210px; text-align: center; }
  .sign span { display: block; margin-top: 54px; border-top: 1px solid #0f172a; padding-top: 4px; font-size: 11px; }
`

/** Resume cetak satu rekam medis. Dipakai tombol "Cetak Rekam Medis (PDF)" — browser yang menyimpan ke PDF. */
export function printExaminationResume(exam: ExaminationDetailDto) {
  if (!import.meta.client)
    return

  const age = calcAge(exam.patient.birthDate)
  const printWindow = window.open('', 'dentacare-resume', 'width=900,height=1100')
  if (!printWindow)
    return

  const html = `<!DOCTYPE html>
<html lang="id"><head><meta charset="utf-8"><title>Rekam Medis ${esc(exam.patient.medicalRecordNo)}</title>
<style>${STYLES}</style></head><body>
  <h1>DentaCare Pro — Resume Pemeriksaan Gigi &amp; Mulut</h1>
  <p class="sub">Dokumen tercetak pada ${esc(formatDateId(new Date()))} · Status: ${esc(exam.status)}</p>

  <h2>Identitas Pasien</h2>
  <table><tbody>
    ${row('No. Rekam Medis', exam.patient.medicalRecordNo)}
    ${row('Nama', exam.patient.fullName)}
    ${row('Tgl Lahir / Usia', `${formatDateId(exam.patient.birthDate)} · ${age ?? '-'} tahun`)}
    ${row('Jenis Kelamin', genderLabel[exam.patient.gender])}
    ${row('Dokter Pemeriksa', exam.examinerName)}
    ${row('Tanggal Pemeriksaan', formatDateId(exam.examDate))}
  </tbody></table>

  <h2>Pemeriksaan Objektif</h2>
  <table><tbody>
    ${row('Keluhan Utama', exam.chiefComplaint)}
    ${row('Tekanan Darah', exam.bloodPressure ?? '-')}
    ${row('Denyut Jantung', exam.heartRate === null ? '-' : `${exam.heartRate}x/menit · ${exam.heartRhythm}`)}
    ${row('Kondisi Gingiva', exam.gingivaCondition)}
    ${row('Derajat Mobilitas', String(exam.mobilityDegree))}
    ${row('Kondisi Mukosa', exam.mucosaCondition)}
  </tbody></table>

  <h2>Indeks Kebersihan Mulut</h2>
  <table><thead><tr><th>FDI</th><th>Nama Gigi</th><th>Permukaan</th><th>Debris / Kalkulus</th></tr></thead>
  <tbody>${indexRows(exam)}</tbody></table>
  <p class="score">
    <span>DI-S <b>${formatScore(exam.debrisIndex)}</b></span>
    <span>CI-S <b>${formatScore(exam.calculusIndex)}</b></span>
    <span>OHI-S <b>${formatScore(exam.ohisScore)}</b></span>
    <span>Kategori <b>${ohisCategoryLabel[exam.ohisCategory]}</b></span>
    <span>Gigi Sehat <b>${exam.healthyTeeth}/32</b></span>
    <span>DMFT <b>${exam.dmftScore}</b></span>
  </p>

  <h2>Odontogram</h2>
  <table><thead><tr><th>FDI</th><th>Kondisi</th><th>Catatan</th></tr></thead>
  <tbody>${toothRows(exam)}</tbody></table>

  <h2>Diagnosis &amp; Rencana Perawatan</h2>
  <table><tbody>
    ${row('Diagnosis Kebersihan Mulut', exam.hygieneDiagnosis ?? '-')}
    ${row('Rencana Tindakan', exam.planOfAction.length > 0 ? exam.planOfAction.join('; ') : '-')}
    ${row('Catatan Resep', exam.prescriptionNote ?? '-')}
    ${row('Jadwal Kontrol', exam.nextVisitAt ? formatDateId(exam.nextVisitAt) : '-')}
    ${row('Catatan Kontrol', exam.nextVisitNote ?? '-')}
  </tbody></table>

  <div class="sign"><div>Tanda Tangan Dokter<span>${esc(exam.examinerName)}</span></div></div>
</body></html>`

  // Blob (bukan document.write) supaya markup dinamis tidak pernah dieksekusi sebagai sumber dokumen.
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  printWindow.location.replace(url)
  printWindow.addEventListener('load', () => {
    printWindow.focus()
    printWindow.print()
    URL.revokeObjectURL(url)
  }, { once: true })
}
