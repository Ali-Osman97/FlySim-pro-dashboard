import { NextResponse } from "next/server"
import { fetchDashboardData } from "@/lib/dashboard-proxy"

export async function GET() {
  const result = await fetchDashboardData(
    "/api/dashboard/reports",
    "Dashboard reports service is unavailable"
  )
  return NextResponse.json(result.body, { status: result.status })
}
