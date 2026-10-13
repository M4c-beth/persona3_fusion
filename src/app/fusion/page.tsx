import type { Metadata } from "next";
import { Suspense } from "react";
import { FusionPlanner } from "@/components/features/FusionPlanner";

export const metadata: Metadata = { title: "Fusion Planner" };

export default function FusionPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-heading text-4xl font-extrabold uppercase italic tracking-tight">Fusion</h1>
        <p className="text-muted-foreground">Pick a persona and its skills to get a step-by-step fusion path.</p>
      </header>
      <Suspense>
        <FusionPlanner />
      </Suspense>
    </div>
  );
}
