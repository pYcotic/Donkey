import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Server, CircuitBoard, Cpu, MemoryStick, 
  Monitor, HardDrive, Zap, Wind,
  AlertTriangle
} from 'lucide-react'

const SLOTS = [
  { key: "chassis", label: "Chassis", Icon: Server },
  { key: "motherboard", label: "Motherboard", Icon: CircuitBoard },
  { key: "cpu", label: "CPU", Icon: Cpu },
  { key: "ram", label: "RAM", Icon: MemoryStick },
  { key: "gpu", label: "GPU", Icon: Monitor },
  { key: "storage", label: "Storage", Icon: HardDrive },
  { key: "psu", label: "PSU", Icon: Zap },
  { key: "cooling", label: "Cooling", Icon: Wind },
]

interface SidebarProps {
  build?: Record<string, any>
  total?: number
  filledCount?: number
  allIssues?: Array<{ slot: string; issue: string }>
}

export default function Sidebar({ 
  build = {}, 
  total = 0, 
  filledCount = 0, 
  allIssues = [] 
}: SidebarProps) {
  return (
    <aside className="w-64 border-r border-[#1A1A1E] flex flex-col flex-shrink-0 bg-[#0D0D0F]">
      {/* Summary */}
      <div className="px-5 py-4 border-b border-[#1A1A1E]">
        <p className="font-mono text-[9px] tracking-[0.2em] text-[#3A3A48] uppercase mb-1">
          Build Summary
        </p>
        <p className="font-['Bebas_Neue'] text-4xl text-white tracking-wide leading-none">
          <span className="text-lg text-[#5A5A68] mr-0.5">R</span>
          {total.toLocaleString()}
        </p>
        <p className="font-mono text-[10px] text-[#3A3A48] mt-1">
          {filledCount} of {SLOTS.length} slots filled
        </p>
      </div>

      {/* Progress */}
      <div className="px-5 py-3 border-b border-[#1A1A1E]">
        <div className="flex gap-0.5">
          {SLOTS.map(({ key }) => (
            <div
              key={key}
              className={`h-1 flex-1 transition-all ${build[key] ? "bg-[#FF4C0C]" : "bg-[#1E1E26]"}`}
            />
          ))}
        </div>
        <p className="font-mono text-[9px] text-[#3A3A48] mt-1.5 uppercase tracking-wider">
          {Math.round((filledCount / SLOTS.length) * 100)}% complete
        </p>
      </div>

      {/* Wattage Bar */}
      <div className="px-5 py-3 border-b border-[#1A1A1E]">
        <WattageBar build={build} />
      </div>

      {/* Part list */}
      <ScrollArea className="flex-1">
        <div className="px-5 py-3 space-y-0">
          {SLOTS.map(({ key, label, Icon }) => {
            const part = build[key]
            return (
              <div key={key} className="flex items-center gap-3 py-2.5 border-b border-[#1A1A1E] last:border-0">
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${part ? "text-[#FF4C0C]" : "text-[#2A2A32]"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[9px] tracking-wider text-[#3A3A48] uppercase">{label}</p>
                  <p className="text-xs text-[#C8C8D0] truncate">{part?.name ?? "—"}</p>
                </div>
                {part && (
                  <span className="font-['Bebas_Neue'] text-base text-[#5A5A68] tracking-wide flex-shrink-0">
                    ${part.price}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Issues */}
      {allIssues.length > 0 && (
        <div className="border-t border-[#1A1A1E] px-5 py-3 bg-[#EAB308]/[0.03]">
          <p className="font-mono text-[9px] tracking-widest text-[#EAB308] uppercase mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-2.5 h-2.5" /> Compatibility Issues
          </p>
          {allIssues.map((iss, i) => (
            <p key={i} className="font-mono text-[9px] text-[#EAB308]/70 mb-1 leading-relaxed">
              · {iss.issue}
            </p>
          ))}
        </div>
      )}
    </aside>
  )
}

function WattageBar({ build }: { build: Record<string, any> }) {
  const used = estimateWatts(build)
  const cap = build.psu?.watt ?? 0
  const pct = cap > 0 ? Math.min((used / cap) * 100, 100) : 0
  const status = pct > 90 ? "critical" : pct > 75 ? "warn" : "ok"

  if (!build.gpu && !build.cpu) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[9px] tracking-[0.18em] text-[#3A3A48] uppercase">Power Budget</span>
          <span className="font-mono text-[10px] font-medium text-[#3A3A48]">—</span>
        </div>
        <div className="h-1 bg-[#1A1A1E] relative overflow-hidden">
          <div className="h-full bg-[#1E1E26]" style={{ width: '30%' }} />
        </div>
        <p className="font-mono text-[9px] text-[#3A3A48] mt-1.5">Add a PSU to see headroom</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[9px] tracking-[0.18em] text-[#3A3A48] uppercase">Power Budget</span>
        <span className={`font-mono text-[10px] font-medium ${
          status === "critical" ? "text-[#EF4444]" : status === "warn" ? "text-[#EAB308]" : "text-[#C8C8D0]"
        }`}>
          {used}W {cap > 0 ? `/ ${cap}W` : "estimated"}
        </span>
      </div>
      <div className="h-1 bg-[#1A1A1E] relative overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            status === "critical" ? "bg-[#EF4444]" : status === "warn" ? "bg-[#EAB308]" : "bg-[#FF4C0C]"
          }`}
          style={{ width: `${cap > 0 ? pct : 30}%` }}
        />
      </div>
    </div>
  )
}

function estimateWatts(build: Record<string, any>) {
  const cpu = build.cpu?.tdp ?? 0
  const gpu = build.gpu?.watt ?? 0
  const sys = cpu + gpu > 0 ? 80 : 0
  return cpu + gpu + sys
}