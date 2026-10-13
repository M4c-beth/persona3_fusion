import type { Metadata } from "next";
import { Suspense } from "react";
import { SkillTable } from "@/components/features/SkillTable";

export const metadata: Metadata = { title: "Skills" };

export default function SkillsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-4xl font-extrabold uppercase italic tracking-tight">Skills</h1>
        <p className="text-muted-foreground">Every skill a persona can learn, and who learns it.</p>
      </header>
      <Suspense>
        <SkillTable />
      </Suspense>
    </div>
  );
}
