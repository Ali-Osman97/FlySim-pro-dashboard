"use client"

import { Bell, Plane, Search, Settings } from "lucide-react"

export type DashboardView = "overview" | "simulation" | "skills" | "reports"

export function DashboardHeader({
  activeView,
  onViewChange,
}: {
  activeView: DashboardView
  onViewChange: (view: DashboardView) => void
}) {
  const items: Array<{ id: DashboardView; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "simulation", label: "Simulation" },
    { id: "skills", label: "Skills" },
    { id: "reports", label: "Reports" },
  ]

  return (
    <header className="border-b border-zinc-800/60 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        {/* Brand Logo (Left) */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Plane className="h-5 w-5 -rotate-45" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1">
              FlightSim Pro
            </div>
            <div className="text-[10px] font-medium tracking-wider uppercase text-zinc-500">
              Engineering Assessment
            </div>
          </div>
        </div>

        {/* Centered Navigation (Middle) */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/40 p-1 rounded-lg border border-zinc-800/40">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={[
                "rounded-md px-4 py-1.5 text-xs font-semibold transition-all duration-200",
                activeView === item.id
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/30",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-4">
          <button className="text-zinc-400 hover:text-white transition-colors cursor-pointer hidden sm:block">
            <Search className="h-4 w-4" />
          </button>
          <button className="relative text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors cursor-pointer hidden sm:block">
            <Settings className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 border-l border-zinc-800/80 pl-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-950 text-xs font-bold text-emerald-400 border border-emerald-500/20 shadow-inner select-none cursor-pointer">
              MR
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Nav row */}
      <div className="md:hidden border-t border-zinc-800/40 bg-zinc-900/20 px-4 py-2">
        <nav className="flex justify-around items-center">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={[
                "rounded-md px-3 py-1 text-xs font-medium transition-all",
                activeView === item.id
                  ? "text-emerald-400 font-bold"
                  : "text-zinc-400 hover:text-white",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

