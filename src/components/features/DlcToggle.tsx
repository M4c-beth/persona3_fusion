"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { DLC_PACKS } from "@/types/game";
import { cn } from "@/lib/utils";
import { useDlc } from "./DlcProvider";

const PACK_NOTE: Record<(typeof DLC_PACKS)[number], string> = {
  "P5R Persona Set 1": "Arsène, Zorro, Carmen +6",
  "P5R Persona Set 2": "Satanael, Mercurius, Hecate +6",
  "P4G Persona Set": "Izanagi, Magatsu-Izanagi, Kaguya",
};

export function DlcToggle() {
  const { enabled, setPack, setAll } = useDlc();
  const count = enabled.size;
  const allOn = count === DLC_PACKS.length;

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "clip-slant flex h-8 shrink-0 items-center gap-1.5 px-2.5 font-heading sm:gap-2 sm:px-3.5 text-sm font-bold uppercase tracking-wider transition-colors",
          count
            ? "bg-p3r-white text-p3r-navy hover:bg-p3r-white/90"
            : "bg-secondary text-muted-foreground hover:text-foreground",
        )}
        aria-label={`DLC personas: ${count ? `${count} of ${DLC_PACKS.length} packs on` : "off"}`}
      >
        DLC
        <span className={cn("text-xs", count ? "text-p3r-navy/70" : "text-muted-foreground/70")}>
          {count ? (allOn ? "On" : `${count}/${DLC_PACKS.length}`) : "Off"}
        </span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-0 p-0">
        <label className="flex cursor-pointer items-center justify-between gap-4 border-b px-4 py-3">
          <span>
            <span className="block font-heading text-base font-bold uppercase tracking-wide">DLC Personas</span>
            <span className="block text-xs text-muted-foreground">Include paid Persona packs in fusions</span>
          </span>
          <Switch checked={allOn} onCheckedChange={(on) => setAll(on)} aria-label="All DLC packs" />
        </label>
        <ul className="py-1">
          {DLC_PACKS.map((pack) => (
            <li key={pack}>
              <label className="flex cursor-pointer items-center justify-between gap-4 px-4 py-2 hover:bg-accent/50">
                <span>
                  <span className="block text-sm">{pack}</span>
                  <span className="block text-xs text-muted-foreground">{PACK_NOTE[pack]}</span>
                </span>
                <Switch size="sm" checked={enabled.has(pack)} onCheckedChange={(on) => setPack(pack, on)} />
              </label>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
