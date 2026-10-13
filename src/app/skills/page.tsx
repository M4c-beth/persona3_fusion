import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/features/PageHeader";
import { SkillTable } from "@/components/features/SkillTable";

export const metadata: Metadata = { title: "Skills" };

export default function SkillsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Skill List" backdrop="Skills">
        Every skill a persona can learn, and who learns it.
      </PageHeader>
      <Suspense>
        <SkillTable />
      </Suspense>
    </div>
  );
}
