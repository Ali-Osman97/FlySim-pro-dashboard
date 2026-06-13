import type { ReportItem } from "@/lib/dashboard-schemas"

const FORMULA_PREFIX_PATTERN = /^[\u0000-\u0020]*[=+\-@]/

export function sanitizeSpreadsheetCell(value: string | number): string {
  const text = String(value)
  return FORMULA_PREFIX_PATTERN.test(text) ? `'${text}` : text
}

export function escapeCsvCell(value: string | number): string {
  const sanitized = sanitizeSpreadsheetCell(value)
  return `"${sanitized.replaceAll('"', '""')}"`
}

export function buildReportsCsv(reports: ReportItem[]): string {
  const header = ["Report ID", "Title", "Discipline", "Risk Level", "Date"]
  const rows = reports.map((report) => [
    report.id,
    report.title,
    report.discipline,
    report.risk,
    report.date,
  ])

  return [header, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\r\n")
}
