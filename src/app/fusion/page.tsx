import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FusionCalculator } from "@/components/features/FusionCalculator";

export const metadata: Metadata = { title: "Fusion Calculator" };

export default function FusionPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-heading text-4xl font-extrabold uppercase italic tracking-tight">Fusion</h1>
        <p className="text-muted-foreground">
          Pick two personas to see the result. To work backwards, open any persona in the{" "}
          <Link href="/" className="text-foreground underline decoration-dotted underline-offset-2 hover:text-p3r-yellow">
            compendium
          </Link>
          .
        </p>
      </header>
      <Suspense>
        <FusionCalculator />
      </Suspense>
    </div>
  );
}
