/// <reference lib="webworker" />
import type { DlcPack } from "@/types/game";
import { FUSION_CHART, PERSONAS, getPersona } from "./data";
import { createFusionPool, type FusionPool } from "./fusion";
import { findFusionPaths, type PlanResult } from "./planner";

export interface PlanRequest {
  id: number;
  target: string;
  skills: string[];
  dlc: DlcPack[];
}

export interface PlanResponse {
  id: number;
  result: PlanResult;
}

let cached: { key: string; pool: FusionPool } | null = null;

function poolFor(dlc: DlcPack[]): FusionPool {
  const key = [...dlc].sort().join("|");
  if (cached?.key !== key) cached = { key, pool: createFusionPool(PERSONAS, FUSION_CHART, new Set(dlc)) };
  return cached.pool;
}

self.onmessage = (event: MessageEvent<PlanRequest>) => {
  const { id, target, skills, dlc } = event.data;
  const persona = getPersona(target);
  const result: PlanResult = persona
    ? findFusionPaths(poolFor(dlc), persona, skills)
    : { paths: [], failure: { kind: "no-recipe" } };
  self.postMessage({ id, result } satisfies PlanResponse);
};
