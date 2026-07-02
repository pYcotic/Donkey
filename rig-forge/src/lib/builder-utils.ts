import { Server, CircuitBoard, Cpu, MemoryStick, Monitor, HardDrive, Zap, Wind } from "lucide-react";
import type { ComponentType } from "react";

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface CatalogItem {
  id: string;
  brand: string;
  name: string;
  spec: string;
  price: number;
  tags: string[];
  // Optional properties that vary by category
  formfactor?: string;
  socket?: string;
  memType?: string;
  tdp?: number;
  watt?: number;
  capacity?: number;
  wattBudget?: number | null;
}

export interface SlotConfig {
  key: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  hint: string;
}

// ─── CATALOG ──────────────────────────────────────────────────────────────────

export const CATALOG: Record<string, CatalogItem[]> = {
  // ... (all your catalog data)
};

// ─── SLOT CONFIG ──────────────────────────────────────────────────────────────

export const SLOTS: SlotConfig[] = [
  // ... (all your slots)
];

// ─── COMPATIBILITY ENGINE ─────────────────────────────────────────────────────

export function getCompatibility(
  item: CatalogItem, 
  slot: string, 
  build: Record<string, CatalogItem | undefined>
): string[] {
  const issues: string[] = [];

  if (slot === "motherboard" && build.chassis) {
    const ff = build.chassis.formfactor;
    if (ff === "ATX" && item.formfactor === "E-ATX") {
      issues.push("E-ATX board won't fit in ATX chassis");
    }
  }

  if (slot === "cpu") {
    if (build.motherboard && item.socket && build.motherboard.socket) {
      if (item.socket !== build.motherboard.socket) {
        issues.push(`${item.socket} CPU incompatible with ${build.motherboard.socket} board`);
      }
    }
  }

  if (slot === "ram" && build.motherboard) {
    if (item.memType && build.motherboard.memType) {
      if (item.memType !== build.motherboard.memType) {
        issues.push(`${item.memType} RAM incompatible with board's ${build.motherboard.memType} slots`);
      }
    }
  }

  if (slot === "gpu" && build.psu) {
    const systemDraw = (build.cpu?.tdp ?? 0) + (item.watt ?? 0) + 80;
    const headroom = build.psu.watt! - systemDraw;
    if (headroom < 150) {
      issues.push(`PSU headroom only ${headroom}W — recommend 150W+ buffer`);
    }
  }

  if (slot === "psu" && build.gpu) {
    const systemDraw = (build.cpu?.tdp ?? 0) + (build.gpu?.watt ?? 0) + 80;
    const headroom = item.watt! - systemDraw;
    if (headroom < 150) {
      issues.push(`Only ${headroom}W headroom with current GPU — tight`);
    }
  }

  return issues;
}

export function buildIssues(build: Record<string, CatalogItem | undefined>) {
  const all: Array<{ slot: string; issue: string }> = [];
  SLOTS.forEach(({ key }) => {
    const item = build[key];
    if (!item) return;
    const issues = getCompatibility(item, key, { ...build, [key]: undefined });
    issues.forEach(i => all.push({ slot: key, issue: i }));
  });
  return all;
}

// ─── WATTAGE ESTIMATE ─────────────────────────────────────────────────────────

export function estimateWatts(build: Record<string, CatalogItem | undefined>) {
  const cpu = build.cpu?.tdp ?? 0;
  const gpu = build.gpu?.watt ?? 0;
  const sys = cpu + gpu > 0 ? 80 : 0;
  return cpu + gpu + sys;
}