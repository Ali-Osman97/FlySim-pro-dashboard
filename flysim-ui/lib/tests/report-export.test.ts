import { buildReportsCsv, escapeCsvCell, sanitizeSpreadsheetCell } from "@/lib/report-export"
import type { ReportItem } from "@/lib/dashboard-schemas"

describe("report CSV export", () => {
  it.each(["=SUM(A1:A2)", "+cmd", "-10+20", "@IMPORTDATA", "\t=formula", "\r+formula", "  =SUM(A1:A2)"])(
    "neutralizes spreadsheet formula prefix %s",
    (value) => {
      expect(sanitizeSpreadsheetCell(value)).toBe(`'${value}`)
    }
  )

  it("escapes quotes after sanitizing formula cells", () => {
    expect(escapeCsvCell('="danger"')).toBe(`"'=""danger"""`)
  })

  it("builds a CSV with protected report values", () => {
    const reports: ReportItem[] = [
      {
        id: "REP-26-05",
        title: "=HYPERLINK(\"https://example.com\")",
        discipline: "Systems Architecture",
        risk: "Medium",
        date: "May 18, 2026",
      },
    ]

    expect(buildReportsCsv(reports)).toContain(`"'=HYPERLINK(""https://example.com"")"`)
  })
})
