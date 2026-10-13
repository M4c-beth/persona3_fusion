import { PageHeader } from "@/components/features/PageHeader";
import { PersonaTable } from "@/components/features/PersonaTable";

export default function PersonasPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="The Compendium" backdrop="Personas">
        Every persona in Persona 3 Reload. Pick one to see how to fuse it.
      </PageHeader>
      <PersonaTable />
    </div>
  );
}
