"use client"

import { SimulationWorkspace } from "@/components/dashboard/simulation/simulation-workspace"

export default function SimulationPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Simulation</h2>
        <p className="text-sm text-muted-foreground">
          Configure and submit new engineering flight simulations to the backend.
        </p>
      </div>
      <SimulationWorkspace />
    </div>
  )
}

