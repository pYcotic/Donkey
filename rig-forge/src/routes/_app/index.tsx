import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { SLOTS, getCompatibility, buildIssues } from '@/lib/builder-utils'
import SlotRow from '@/components/slot-row'
import PartPickerModal from '@/components/part-picker-modal'
import { createFileRoute } from '@tanstack/react-router'
import { Info } from 'lucide-react'

import type { CatalogItem, SlotConfig } from '@/lib/builder-utils'

export const Route = createFileRoute('/_app/')({
  component: Index,
})

export default function Index() {
  const [build, setBuild] = useState<Record<string, CatalogItem>>({})
  const [activeSlot, setActiveSlot] = useState<SlotConfig | null>(null)

  const selectPart = (key: string, item: CatalogItem) => {
    setBuild(prev => ({ ...prev, [key]: item }))
  }

  const removePart = (key: string) => {
    setBuild(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const filledCount = Object.keys(build).length
  const allIssues = buildIssues(build)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header row */}
      <div className="px-8 py-5 border-b border-[#1A1A1E] flex items-center justify-between">
        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] text-[#3A3A48] uppercase mb-0.5">
            // component slots
          </p>
          <h1 className="font-['Bebas_Neue'] text-3xl text-white tracking-widest leading-none">
            Configure Your Rig
          </h1>
        </div>
        <p className="font-mono text-[10px] text-[#3A3A48] max-w-56 text-right leading-relaxed">
          Select components in order — compatibility filters automatically as you go.
        </p>
      </div>

      {/* Slots */}
      <div className="px-8 py-6 space-y-2">
        {SLOTS.map(slot => {
          const part = build[slot.key]
          const slotIssues = part
            ? getCompatibility(part, slot.key, { ...build, [slot.key]: undefined })
            : []

          return (
            <SlotRow
              key={slot.key}
              slot={slot}
              part={part}
              isActive={activeSlot?.key === slot.key}
              onOpen={setActiveSlot}
              onRemove={removePart}
              issues={slotIssues}
            />
          )
        })}
      </div>

      {/* Bottom hint */}
      {filledCount === 0 && (
        <div className="px-8 pb-8 flex items-start gap-3">
          <Info className="w-4 h-4 text-[#3A3A48] mt-0.5 shrink-0" />
          <p className="font-mono text-[10px] text-[#3A3A48] leading-relaxed max-w-lg">
            Start with the <strong className="text-[#5A5A68]">Chassis</strong> — it determines which motherboard sizes fit, and which cooling solutions clear.
            Not sure where to start? Hit <strong className="text-[#5A5A68]">Load Preset</strong> in the top bar to see a complete build.
          </p>
        </div>
      )}

      {/* Part Picker Dialog */}
      <Dialog open={!!activeSlot} onOpenChange={open => !open && setActiveSlot(null)}>
        {activeSlot && (
          <PartPickerModal
            slot={activeSlot}
            build={build}
            onSelect={selectPart}
            onClose={() => setActiveSlot(null)}
          />
        )}
      </Dialog>
    </div>
  )
}