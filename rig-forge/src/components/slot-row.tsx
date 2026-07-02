import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, X, SlidersHorizontal, AlertTriangle } from "lucide-react";

interface SlotRowProps {
  slot: {
    key: string;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    hint: string;
  };
  part: any;
  isActive: boolean;
  onOpen: (slot: any) => void;
  onRemove: (key: string) => void;
  issues: string[];
}

export default function SlotRow({ 
  slot, 
  part, 
  isActive, 
  onOpen, 
  onRemove, 
  issues 
}: SlotRowProps) {
  const { Icon, label } = slot;
  const hasIssue = issues.length > 0;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={`group flex items-center gap-0 border transition-all cursor-pointer
          ${isActive
            ? "border-[#FF4C0C]/60 bg-[#FF4C0C]/3"
            : part
              ? hasIssue
                ? "border-[#EAB308]/30 bg-[#1A1A16] hover:border-[#EAB308]/50"
                : "border-[#2A2A32] bg-[#13131A] hover:border-[#FF4C0C]/30"
              : "border-[#1E1E26] bg-[#0F0F12] hover:border-[#2A2A32]"
          }`}
        onClick={() => onOpen(slot)}
      >
        {/* Left accent bar */}
        <div className={`w-0.5 self-stretch transition-all ${
          isActive ? "bg-[#FF4C0C]" : part ? hasIssue ? "bg-[#EAB308]" : "bg-[#FF4C0C]/40" : "bg-transparent group-hover:bg-[#2A2A32]"
        }`} />

        {/* Icon */}
        <div className={`w-11 h-11 shrink-0 flex items-center justify-center mx-4 border transition-all
          ${part ? "border-[#FF4C0C]/25 bg-[#FF4C0C]/[0.07]" : "border-[#1E1E26] bg-[#1A1A1E] group-hover:border-[#2A2A32]"}`}>
          <Icon className={`w-4 h-4 transition-colors ${part ? "text-[#FF4C0C]" : "text-[#3A3A48] group-hover:text-[#5A5A68]"}`} />
        </div>

        {/* Label + value */}
        <div className="flex-1 py-3.5 min-w-0">
          <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#3A3A48] mb-0.5">{label}</p>
          {part ? (
            <div>
              <p className="text-sm font-semibold text-[#E8E8F0] truncate leading-tight">{part.name}</p>
              <p className="font-mono text-[10px] text-[#3A3A48] truncate mt-0.5">{part.brand} · {part.spec.split('·')[0].trim()}</p>
            </div>
          ) : (
            <p className="text-sm text-[#2A2A3A]">Not selected</p>
          )}
        </div>

        {/* Compat / Price */}
        <div className="px-4 text-right shrink-0">
          {part ? (
            <>
              <p className="font-['Bebas_Neue'] text-xl text-white tracking-wide leading-none">
                ${part.price.toLocaleString()}
              </p>
              {hasIssue ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-mono text-[9px] text-[#EAB308] uppercase tracking-wider flex items-center gap-1 justify-end cursor-help">
                      <AlertTriangle className="w-2.5 h-2.5" /> Review
                    </span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    className="bg-[#1A1A1E] border-[#2A2A32] text-[#C8C8D0] font-mono text-[10px] max-w-56"
                    style={{ borderRadius: 0 }}
                  >
                    {issues[0]}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span className="font-mono text-[9px] text-[#22C55E] uppercase tracking-wider">OK</span>
              )}
            </>
          ) : (
            <span className="font-mono text-[9px] text-[#2A2A3A] uppercase tracking-wider">—</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0 border-l border-[#1E1E26] self-stretch">
          {part ? (
            <>
              <button
                onClick={e => { e.stopPropagation(); onOpen(slot); }}
                className="h-full px-3 font-mono text-[9px] text-[#5A5A68] hover:text-[#FF4C0C] hover:bg-[#FF4C0C]/5
                           uppercase tracking-wider transition-all flex items-center gap-1.5 border-r border-[#1E1E26]"
              >
                <SlidersHorizontal className="w-3 h-3" />
                Change
              </button>
              <button
                onClick={e => { e.stopPropagation(); onRemove(slot.key); }}
                className="h-full px-3 text-[#2A2A32] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-all flex items-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); onOpen(slot); }}
              className="h-full px-4 font-mono text-[9px] text-[#3A3A48] hover:text-[#FF4C0C]
                         uppercase tracking-widest transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3 h-3" /> Select
            </button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}