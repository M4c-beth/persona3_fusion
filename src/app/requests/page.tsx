import type { Metadata } from "next";
import { PageHeader } from "@/components/features/PageHeader";
import { RequestList } from "@/components/features/RequestList";

export const metadata: Metadata = { title: "Elizabeth's Requests" };

export default function RequestsPage() {
  return (
    <div className="space-y-10">
      <PageHeader title="Elizabeth's Requests" backdrop="Requests">
        All 101 Velvet Room requests: when they appear, how to finish them, and what you get. Requests open after the
        first full moon (5/10); missable ones show their due date in red.
      </PageHeader>
      <RequestList />
    </div>
  );
}
