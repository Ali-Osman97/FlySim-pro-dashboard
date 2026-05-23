 "use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

function NavTabs() {
  const pathname = usePathname()

  const tabs = [
    { href: "/dashboard/overview", label: "Overview" },
    { href: "/dashboard/simulation", label: "Simulation" },
    { href: "/dashboard/skills", label: "Skills" },
    { href: "/dashboard/reports", label: "Reports" },
  ]

  return (
    <nav className="mb-4 flex space-x-2 rounded-lg bg-gray-900 p-1 ring-1 ring-gray-800">
      {tabs.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={[
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-gray-100 text-gray-900"
                : "text-gray-200 hover:bg-gray-800 hover:text-white",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-gray-800 bg-gray-950 px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-100">FlySim</div>
            <div className="text-xs text-gray-400">Engineering & Project Management Dashboard</div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">
          <NavTabs />
          {children}
        </div>
      </main>
    </div>
  )
}

