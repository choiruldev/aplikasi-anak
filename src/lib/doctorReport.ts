function sanitizePdfAscii(text: string): string {
  return text
    .replaceAll('—', '-')
    .replaceAll('–', '-')
    .replaceAll('·', '|')
    .replaceAll('✓', 'v')
    .replaceAll('≥', '>=')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)');
}

function wrapLine(text: string, maxChars = 82): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if (!current) {
      current = w;
    } else if (current.length + 1 + w.length <= maxChars) {
      current = `${current} ${w}`;
    } else {
      lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Generates a self-contained single-page PDF 1.4 summary report for doctors / posyandu.
 * Zero external libraries or network calls required.
 */
export function buildDoctorReportPdfBytes(params: {
  childName: string;
  ageLabel: string;
  genderLabel: string;
  generatedDate: string;
  summaryLines: string[];
}): Uint8Array {
  const commands: string[] = [
    'BT',
    '/F1 18 Tf',
    '48 770 Td',
    `(Cilukba - Ringkasan Kontrol Tumbuh Kembang) Tj`,
    '0 -24 Td',
    '/F1 12 Tf',
    `(Anak: ${sanitizePdfAscii(params.childName)} | Usia: ${sanitizePdfAscii(params.ageLabel)} | ${sanitizePdfAscii(params.genderLabel)}) Tj`,
    '0 -18 Td',
    '/F1 10 Tf',
    `(Tanggal Cetak: ${sanitizePdfAscii(params.generatedDate)}) Tj`,
    '0 -22 Td',
    '/F1 11 Tf'
  ];

  const wrapped: string[] = [];
  for (const rawLine of params.summaryLines) {
    for (const part of wrapLine(rawLine, 82)) {
      if (wrapped.length < 36) wrapped.push(part);
    }
  }

  for (const line of wrapped) {
    commands.push(`(${sanitizePdfAscii(line)}) Tj`);
    commands.push('0 -15 Td');
  }

  commands.push('0 -12 Td');
  commands.push('/F1 9 Tf');
  commands.push('(Catatan: Informasi referensi ini bersifat edukatif & bukan pengganti diagnosis dokter.) Tj');
  commands.push('ET');

  const stream = commands.join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    `4 0 obj << /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj'
  ];

  const header = '%PDF-1.4\n';
  const offsets: number[] = [];
  let body = '';

  for (const obj of objects) {
    offsets.push(header.length + body.length);
    body += `${obj}\n`;
  }

  const xrefOffset = header.length + body.length;
  const xrefLines = [
    `xref`,
    `0 ${objects.length + 1}`,
    `0000000000 65535 f `,
    ...offsets.map((off) => `${String(off).padStart(10, '0')} 00000 n `)
  ];

  const trailer = [
    `trailer << /Size ${objects.length + 1} /Root 1 0 R >>`,
    `startxref`,
    `${xrefOffset}`,
    '%%EOF',
    ''
  ];

  const pdfString = header + body + xrefLines.join('\n') + '\n' + trailer.join('\n');
  return new TextEncoder().encode(pdfString);
}
