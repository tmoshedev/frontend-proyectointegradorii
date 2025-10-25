interface CsvSection {
  title: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
}

const sanitize = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value.toString();
  const cleaned = value.replace(/"/g, '""');
  return cleaned.includes(',') ? `"${cleaned}"` : cleaned;
};

const buildSection = ({ title, headers, rows }: CsvSection): string => {
  const lines = [] as string[];
  lines.push(title);
  lines.push(headers.join(','));
  rows.forEach(row => {
    lines.push(row.map(sanitize).join(','));
  });
  lines.push('');
  return lines.join('\n');
};

export const buildCsvContent = (sections: CsvSection[]): string => {
  return sections.map(section => buildSection(section)).join('\n');
};

export const downloadCsv = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
