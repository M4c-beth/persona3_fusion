"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { FUSION_CHART, PERSONAS } from "@/lib/game/data";
import { createFusionPool, type FusionPool } from "@/lib/game/fusion";
import { DLC_PACKS, type DlcPack } from "@/types/game";

const STORAGE_KEY = "p3r-fusion:dlc";
const storedSchema = z.array(z.enum(DLC_PACKS));

interface DlcContextValue {
  enabled: ReadonlySet<DlcPack>;
  setPack: (pack: DlcPack, on: boolean) => void;
  setAll: (on: boolean) => void;
  pool: FusionPool;
}

const DlcContext = createContext<DlcContextValue | null>(null);

function readStored(): DlcPack[] {
  try {
    const parsed = storedSchema.safeParse(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function DlcProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState<ReadonlySet<DlcPack>>(() => new Set());

  useEffect(() => {
    const stored = readStored();
    if (stored.length) setEnabled(new Set(stored));
  }, []);

  const update = useCallback((next: Set<DlcPack>) => {
    setEnabled(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // Storage unavailable (private mode); the choice just won't persist.
    }
  }, []);

  const setPack = useCallback(
    (pack: DlcPack, on: boolean) => {
      const next = new Set(enabled);
      if (on) next.add(pack);
      else next.delete(pack);
      update(next);
    },
    [enabled, update],
  );

  const setAll = useCallback((on: boolean) => update(new Set(on ? DLC_PACKS : [])), [update]);

  const pool = useMemo(() => createFusionPool(PERSONAS, FUSION_CHART, enabled), [enabled]);

  const value = useMemo(() => ({ enabled, setPack, setAll, pool }), [enabled, setPack, setAll, pool]);
  return <DlcContext.Provider value={value}>{children}</DlcContext.Provider>;
}

export function useDlc(): DlcContextValue {
  const ctx = useContext(DlcContext);
  if (!ctx) throw new Error("useDlc must be used inside DlcProvider");
  return ctx;
}
