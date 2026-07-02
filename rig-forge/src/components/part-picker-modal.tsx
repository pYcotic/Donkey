import { useState, useMemo } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search, AlertTriangle } from "lucide-react";
import { CATALOG, getCompatibility } from "@/lib/builder-utils";

import type { ComponentType } from "react";

interface SlotConfig {
  key: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  hint: string;
}

interface CatalogItem {
  id: string;
  brand: string;
  name: string;
  spec: string;
  price: number;
  tags: string[];
  [key: string]: any; // For additional properties like formfactor, socket, etc.  hpe this works out later
}

interface PartPickerModalProps {
  slot: SlotConfig;
  build: Record<string, CatalogItem | undefined>;
  onSelect: (key: string, item: CatalogItem) => void;
  onClose: () => void;
}

export default function PartPickerModal({ 
  slot, 
  build, 
  onSelect, 
  onClose 
}: PartPickerModalProps) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const items: CatalogItem[] = CATALOG[slot.key as keyof typeof CATALOG] ?? [];

  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => i.tags.forEach(t => set.add(t)));
    return ["All", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(item => {
      const q = query.toLowerCase();
      const matchQ = !q || `${item.brand} ${item.name} ${item.spec}`.toLowerCase().includes(q);
      const matchTag = activeTag === "All" || item.tags.includes(activeTag);
      return matchQ && matchTag;
    });
  }, [items, query, activeTag]);

  const { Icon } = slot;

  // Get emoji based on slot type
  const getEmoji = (key: string): string => {
    switch(key) {
      case "chassis": return "🖥️";
      case "motherboard": return "🔲";
      case "cpu": return "⚡";
      case "ram": return "💾";
      case "gpu": return "🎮";
      case "storage": return "💿";
      case "psu": return "🔌";
      case "cooling": return "❄️";
      default: return "🔧";
    }
  };

  return (
    <DialogContent
      className="max-w-2xl p-0 gap-0 border-[#2A2A32] bg-[#111114] text-[#C8C8D0] overflow-hidden"
      style={{ borderRadius: 0 }}
    >
      {/* Header */}
      <DialogHeader className="px-6 pt-5 pb-4 border-b border-[#1E1E26]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center border border-[#2A2A32] bg-[#1A1A1E]">
            <Icon className="w-4 h-4 text-[#FF4C0C]" />
          </div>
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] text-[#FF4C0C] uppercase mb-0.5">
              // select component
            </p>
            <DialogTitle className="font-['Bebas_Neue'] text-2xl tracking-widest text-white leading-none">
              {slot.label.toUpperCase()}
            </DialogTitle>
          </div>
        </div>
        <p className="text-xs text-[#3A3A48] mt-2 font-mono">{slot.hint}</p>
      </DialogHeader>

      {/* Search */}
      <div className="px-6 py-3 border-b border-[#1E1E26] relative">
        <Search className="absolute left-9 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3A3A48]" />
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, brand, or spec…"
          className="w-full bg-[#0D0D0F] border border-[#2A2A32] text-[#C8C8D0] placeholder-[#3A3A48]
                     font-mono text-xs py-2.5 pl-8 pr-4 outline-none
                     focus:border-[#FF4C0C]/40 transition-colors"
          style={{ borderRadius: 0 }}
        />
      </div>

      {/* Tag filters */}
      <div className="px-6 py-2.5 border-b border-[#1E1E26] flex gap-1.5 overflow-x-auto scrollbar-none">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`font-mono text-[9px] tracking-[0.14em] uppercase px-3 py-1.5 border whitespace-nowrap transition-all
              ${activeTag === tag
                ? "bg-[#FF4C0C]/10 border-[#FF4C0C]/40 text-[#FF4C0C]"
                : "bg-[#1A1A1E] border-[#2A2A32] text-[#5A5A68] hover:text-[#C8C8D0] hover:border-[#3A3A48]"
              }`}
            style={{ borderRadius: 0 }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* List */}
      <ScrollArea className="max-h-[380px]">
        {filtered.length === 0 ? (
          <div className="py-16 text-center font-mono text-xs text-[#3A3A48] tracking-widest uppercase">
            No components match
          </div>
        ) : (
          <div className="divide-y divide-[#1A1A1E]">
            {filtered.map(item => {
              const issues = getCompatibility(item, slot.key, build);
              const isSelected = build[slot.key]?.id === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => { onSelect(slot.key, item); onClose(); }}
                  className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all group
                    border-l-2 hover:bg-[#16161A]
                    ${isSelected
                      ? "border-l-[#FF4C0C] bg-[#FF4C0C]/[0.04]"
                      : issues.length
                        ? "border-l-[#EAB308]/50 hover:border-l-[#EAB308]"
                        : "border-l-transparent hover:border-l-[#FF4C0C]"
                    }`}
                >
                  {/* Icon cell */}
                  <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border text-xl
                    ${isSelected ? "border-[#FF4C0C]/40 bg-[#FF4C0C]/10" : "border-[#2A2A32] bg-[#1A1A1E]"}`}>
                    {getEmoji(slot.key)}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[9px] tracking-[0.14em] text-[#3A3A48] uppercase mb-0.5">
                      {item.brand}
                    </p>
                    <p className="text-sm font-semibold text-[#C8C8D0] group-hover:text-white transition-colors truncate">
                      {item.name}
                    </p>
                    <p className="font-mono text-[10px] text-[#3A3A48] mt-0.5">{item.spec}</p>

                    {issues.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertTriangle className="w-3 h-3 text-[#EAB308] flex-shrink-0" />
                        <p className="font-mono text-[9px] text-[#EAB308] truncate">{issues[0]}</p>
                      </div>
                    )}
                  </div>

                  {/* Price + compat */}
                  <div className="text-right shrink-0">
                    <p className="font-['Bebas_Neue'] text-2xl text-white tracking-wide leading-none">
                      ${item.price.toLocaleString()}
                    </p>
                    {isSelected ? (
                      <span className="font-mono text-[9px] text-[#FF4C0C] uppercase tracking-wider">Selected</span>
                    ) : issues.length ? (
                      <span className="font-mono text-[9px] text-[#EAB308] uppercase tracking-wider">Review</span>
                    ) : (
                      <span className="font-mono text-[9px] text-[#22C55E] uppercase tracking-wider">Compatible</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[#1E1E26] flex items-center justify-between">
        <span className="font-mono text-[10px] text-[#3A3A48] uppercase tracking-widest">
          {filtered.length} component{filtered.length !== 1 ? "s" : ""}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="font-mono text-[10px] tracking-widest text-[#5A5A68] hover:text-white uppercase h-7 px-3"
          style={{ borderRadius: 0 }}
        >
          Cancel
        </Button>
      </div>

      {/* Scrollbar hide styles */}
      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { scrollbar-width: none; }
      `}</style>
    </DialogContent>
  );
}