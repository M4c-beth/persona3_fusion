import { PersonaTable } from "@/components/features/PersonaTable";

export default function PersonasPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-4xl font-extrabold uppercase italic tracking-tight">Compendium</h1>
        <p className="text-muted-foreground">Every persona in Persona 3 Reload. Pick one to see how to fuse it.</p>
      </header>
      <PersonaTable />
    </div>
  );
}
