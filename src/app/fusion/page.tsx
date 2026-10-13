import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/features/PageHeader";
import { FusionPlanner } from "@/components/features/FusionPlanner";

export const metadata: Metadata = { title: "Fusion Planner" };

export default function FusionPage() {
  return (
    <div className="space-y-10">
      <PageHeader title="Fusion Planner" backdrop="Fusion">
        Pick a persona and its skills to get a step-by-step fusion path.
      </PageHeader>
      <div className="mx-auto max-w-3xl">
        <Suspense>
          <FusionPlanner />
        </Suspense>
      </div>
    </div>
  );
}
