export default function Footer() {
  return (
    <footer className="h-12 border-t border-[#1A1A1E] flex items-center justify-between px-6 flex-shrink-0 bg-[#0A0A0B]/95">
      <p className="font-mono text-[9px] text-[#3A3A48] tracking-widest uppercase">
        RigForge · PC Builder
      </p>
      <div className="flex items-center gap-6">
        <span className="font-mono text-[9px] text-[#3A3A48]">
          {new Date().getFullYear()}
        </span>
        <span className="w-px h-3 bg-[#1E1E26]" />
        <span className="font-mono text-[9px] text-[#3A3A48] tracking-wider">
          ⚡ Build with precision
        </span>
      </div>
    </footer>
  )
}