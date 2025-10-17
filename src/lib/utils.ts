import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadAsCsv(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.error("No data to export.");
    return;
  }

  const replacer = (key: string, value: any) => value === null ? '' : value;
  const header = Object.keys(data[0]);
  let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
  csv.unshift(header.join(','));
  const csvString = csv.join('\r\n');

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
