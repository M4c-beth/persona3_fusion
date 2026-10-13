"use client";

import { useEffect, useRef, useState } from "react";
import type { DlcPack, Persona } from "@/types/game";
import type { FusionPool } from "./fusion";
import { findFusionPaths, type PlanResult } from "./planner";
import type { PlanRequest, PlanResponse } from "./planner.worker";

/**
 * Runs the fusion path search off the main thread. Falls back to running it inline
 * where workers aren't available. `pending` is true while a newer request is in flight.
 */
export function usePlanner(pool: FusionPool, dlc: ReadonlySet<DlcPack>, target: Persona | null, skills: string[]) {
  const worker = useRef<Worker | null>(null);
  const latest = useRef(0);
  const [state, setState] = useState<{ id: number; result: PlanResult | null }>({ id: 0, result: null });

  useEffect(() => {
    if (typeof Worker === "undefined") return;
    const w = new Worker(new URL("./planner.worker.ts", import.meta.url));
    w.onmessage = (event: MessageEvent<PlanResponse>) => {
      if (event.data.id === latest.current) setState(event.data);
    };
    worker.current = w;
    return () => {
      w.terminate();
      worker.current = null;
    };
  }, []);

  const skillsKey = skills.join("\u0000");
  const dlcKey = [...dlc].sort().join("|");

  useEffect(() => {
    const id = ++latest.current;
    if (!target) {
      setState({ id, result: null });
      return;
    }
    const request: PlanRequest = { id, target: target.name, skills, dlc: [...dlc] };
    if (worker.current) {
      worker.current.postMessage(request);
    } else {
      setState({ id, result: findFusionPaths(pool, target, skills) });
    }
    // skills/dlc are tracked through their keys.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, skillsKey, dlcKey, pool]);

  return { result: state.result, pending: state.id !== latest.current };
}
