// Minimal text-only PDF writer (no dependencies): one A4 page, Helvetica, a title, an optional subtitle and
// label / value rows. Enough for downloadable statements like account funding details.

type Row = { label: string; value: string }

// Helvetica (WinAnsi) can't show arbitrary Unicode — keep Latin-1 and swap the rest.
const clean = (s: string) =>
  s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/•/g, '*')
    .replace(/[^\x20-\xff]/g, '?')
const esc = (s: string) => clean(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')

/** Splits text into lines of at most `max` characters on word boundaries. */
function wrap(text: string, max: number) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max) {
      if (line) lines.push(line)
      line = w
    } else line = (line + ' ' + w).trim()
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

export function textPdf({ title, subtitle, rows, footer }: { title: string; subtitle?: string; rows: Row[]; footer?: string }): Blob {
  const ops: string[] = []
  const text = (x: number, y: number, size: number, bold: boolean, s: string, grey = false) =>
    ops.push(`${grey ? '0.42 0.45 0.5' : '0.07 0.1 0.15'} rg BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${esc(s)}) Tj ET`)

  let y = 790
  text(56, y, 20, true, title)
  y -= 22
  if (subtitle) {
    for (const l of wrap(subtitle, 90)) {
      text(56, y, 10, false, l, true)
      y -= 14
    }
  }
  y -= 14
  for (const r of rows) {
    const values = wrap(r.value, 48)
    text(56, y, 10, false, r.label, true)
    values.forEach((v, i) => text(250, y - i * 14, 10, true, v))
    y -= 14 * values.length + 8
    ops.push(`0.93 0.94 0.95 RG 0.5 w 56 ${y + 4} m 539 ${y + 4} l S`)
    y -= 8
  }
  if (footer) {
    y -= 10
    for (const l of wrap(footer, 95)) {
      text(56, y, 8, false, l, true)
      y -= 11
    }
  }

  const content = ops.join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((o, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  // Latin-1 bytes, one per char (the content is already restricted to \x00-\xff).
  const bytes = new Uint8Array(pdf.length)
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff
  return new Blob([bytes], { type: 'application/pdf' })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
