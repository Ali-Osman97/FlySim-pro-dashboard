import { useState } from "react"
import { Dialog, DialogPanel, DialogTitle, Transition } from "@headlessui/react"

export function QuickActions() {
  const [isNewSimOpen, setIsNewSimOpen] = useState(false)

  return (
    <>
      <div className="rounded-lg bg-[#0C101D] border border-slate-800/50 p-4 shadow-sm flex flex-col h-full justify-between">
        <div>
          <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-3">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsNewSimOpen(true)}
              className="w-full rounded-md bg-indigo-600 border border-indigo-500/20 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-indigo-500 transition-all cursor-pointer select-none active:scale-[0.98]"
            >
              Start New Simulation
            </button>
            <button className="w-full rounded-md bg-slate-800/40 border border-slate-700/20 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-350 hover:bg-slate-800 hover:text-white transition-all cursor-pointer select-none">
              Review Last Debrief
            </button>
            <button className="w-full rounded-md bg-slate-800/40 border border-slate-700/20 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-350 hover:bg-slate-800 hover:text-white transition-all cursor-pointer select-none">
              Export Session Report
            </button>
          </div>
        </div>
      </div>

      <Transition show={isNewSimOpen}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsNewSimOpen(false)}
        >
          {/* Backdrop Blur Overlay */}
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-sm rounded-lg bg-[#0C101D] border border-slate-800/60 p-5 shadow-2xl transition-all">
              <DialogTitle className="text-sm font-semibold text-white tracking-wide">
                Start New Simulation
              </DialogTitle>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Configure basic flight parameters to spin up a new high-fidelity FlySim test scenario.
              </p>

              <form
                className="mt-4 space-y-3.5 text-xs"
                onSubmit={(e) => {
                  e.preventDefault()
                  setIsNewSimOpen(false)
                }}
              >
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Scenario Name
                  </label>
                  <input
                    className="w-full rounded-md border border-slate-850 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none"
                    placeholder="e.g. Crosswind landing stress test"
                    required
                  />
                </div>
                
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Environment Profile
                  </label>
                  <select className="w-full rounded-md border border-slate-850 bg-slate-955 px-3 py-2 text-xs text-slate-350 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none cursor-pointer">
                    <option>Nominal (Clear Sky & Low Wind)</option>
                    <option>High Winds & CAT III Turbulence</option>
                    <option>Systems Degraded & Dual Engine Flameout</option>
                  </select>
                </div>
                
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Special Constraints / Notes
                  </label>
                  <textarea
                    className="h-16 w-full resize-none rounded-md border border-slate-850 bg-slate-955 px-3 py-2 text-xs text-slate-200 placeholder-slate-650 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none"
                    placeholder="Optional description of dynamic failures or target skill areas..."
                  />
                </div>

                <div className="mt-5 flex justify-end gap-2.5 pt-1">
                  <button
                    type="button"
                    className="rounded-md border border-slate-850 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:bg-slate-800/40 hover:text-white transition-all cursor-pointer"
                    onClick={() => setIsNewSimOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-indigo-600 border border-indigo-500/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-indigo-500 transition-all cursor-pointer select-none active:scale-[0.98]"
                  >
                    Queue Simulation
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
