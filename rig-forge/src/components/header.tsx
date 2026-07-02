import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trash2, 
  Share2, 
  Download, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react'

interface HeaderProps {
  buildName?: string
  build?: Record<string, any>
  allIssues?: Array<{ slot: string; issue: string }>
  filledCount?: number
  totalSlots?: number
  onLoadPreset?: () => void
  onClearBuild?: () => void
  onShare?: () => void
  onExport?: () => void
}

export default function Header({ 
  buildName = "My Build",
  build = {},
  allIssues = [],
  filledCount = 0,
  totalSlots = 8,
  onLoadPreset,
  onClearBuild,
  onShare,
  onExport
}: HeaderProps) {
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(buildName)

  return (
    <header className="h-14 border-b border-[#1A1A1E] flex items-center px-6 gap-6 flex-shrink-0 bg-[#0A0A0B]/95 backdrop-blur-sm sticky top-0 z-40">
      {/* Logo */}
      <div className="font-['Bebas_Neue'] text-xl tracking-[0.14em] text-white flex items-center gap-1.5 flex-shrink-0">
        RIG<span className="text-[#FF4C0C]">·</span>FORGE
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF4C0C] ml-1 animate-pulse" />
      </div>

      <div className="w-px h-5 bg-[#1E1E26]" />

      {/* Build name */}
      {editingName ? (
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => setEditingName(false)}
          onKeyDown={e => e.key === "Enter" && setEditingName(false)}
          className="bg-transparent border-b border-[#FF4C0C]/50 text-white text-sm font-medium outline-none px-0 py-0.5 w-40 font-mono"
        />
      ) : (
        <button
          onClick={() => setEditingName(true)}
          className="text-sm font-medium text-[#C8C8D0] hover:text-white transition-colors"
        >
          {name}
        </button>
      )}

      {/* Compat badge */}
      {allIssues.length > 0 && (
        <Badge
          className="font-mono text-[9px] tracking-widest uppercase bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/25 gap-1"
          style={{ borderRadius: 0 }}
        >
          <AlertTriangle className="w-2.5 h-2.5" />
          {allIssues.length} issue{allIssues.length !== 1 ? "s" : ""}
        </Badge>
      )}
      {filledCount === totalSlots && allIssues.length === 0 && (
        <Badge
          className="font-mono text-[9px] tracking-widest uppercase bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/25 gap-1"
          style={{ borderRadius: 0 }}
        >
          <CheckCircle2 className="w-2.5 h-2.5" />
          Build complete
        </Badge>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onLoadPreset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadPreset}
            className="font-mono text-[10px] tracking-widest text-[#5A5A68] hover:text-white uppercase h-8"
            style={{ borderRadius: 0 }}
          >
            Load Preset
          </Button>
        )}
        {onClearBuild && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearBuild}
            className="font-mono text-[10px] tracking-widest text-[#5A5A68] hover:text-[#EF4444] uppercase h-8 gap-1.5"
            style={{ borderRadius: 0 }}
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </Button>
        )}
        <div className="w-px h-5 bg-[#1E1E26]" />
        {onShare && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="font-mono text-[10px] tracking-widest text-[#5A5A68] hover:text-white uppercase h-8 gap-1.5"
            style={{ borderRadius: 0 }}
          >
            <Share2 className="w-3 h-3" />
            Share
          </Button>
        )}
        {onExport && (
          <Button
            size="sm"
            onClick={onExport}
            className="bg-[#FF4C0C] hover:bg-[#C23508] text-white font-mono text-[10px] tracking-widest uppercase h-8 px-4 gap-1.5"
            style={{ borderRadius: 0 }}
          >
            <Download className="w-3 h-3" />
            Export Build
          </Button>
        )}
      </div>
    </header>
  )
}