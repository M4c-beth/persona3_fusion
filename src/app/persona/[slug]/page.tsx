import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AffinityStrip } from "@/components/features/AffinityStrip";
import { PersonaFusions } from "@/components/features/PersonaFusions";
import { SkillList } from "@/components/features/SkillList";
import { StatBars } from "@/components/features/StatBars";
import { ArcanaBadge } from "@/components/icons/ArcanaBadge";
import { PERSONAS, getPersonaBySlug } from "@/lib/game/data";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return PERSONAS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const persona = getPersonaBySlug((await params).slug);
  return persona
    ? { title: persona.name, description: `${persona.name} (${persona.arcana}, Lv ${persona.level}) — stats, skills and fusion recipes.` }
    : {};
}

export default async function PersonaPage({ params }: Props) {
  const persona = getPersonaBySlug((await params).slug);
  if (!persona) notFound();

  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Compendium
        </Link>
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
          <h1 className="font-heading text-5xl font-extrabold uppercase italic leading-none tracking-tight">
            {persona.name}
          </h1>
          <span className="font-heading text-2xl font-bold italic text-p3r-yellow">Lv {persona.level}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <ArcanaBadge arcana={persona.arcana} />
          {persona.dlc ? <span className="font-semibold text-p3r-gold">{persona.dlc}</span> : null}
          {persona.unlock ? <span>{persona.unlock}</span> : null}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="space-y-8">
          <Section title="Stats">
            <StatBars stats={persona.stats} />
          </Section>
          <Section title="Affinities">
            <AffinityStrip affinities={persona.affinities} />
          </Section>
          {persona.heartItem ? (
            <Section title="Heart item">
              <p className="text-sm">
                {persona.heartItem.name}{" "}
                <span className="text-muted-foreground">· at Lv {persona.heartItem.level}</span>
              </p>
            </Section>
          ) : null}
        </div>
        <Section title="Skills">
          <SkillList skills={persona.skills} />
        </Section>
      </div>

      <Section
        title="Fusion"
        action={
          <Link href={`/fusion/?t=${persona.slug}`} className="text-sm text-muted-foreground hover:text-p3r-yellow">
            Plan with skills →
          </Link>
        }
      >
        <PersonaFusions persona={persona} />
      </Section>
    </article>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-p3r-blue-light">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
