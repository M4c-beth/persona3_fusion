import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AffinityStrip } from "@/components/features/AffinityStrip";
import { PageHeader } from "@/components/features/PageHeader";
import { PersonaFusions } from "@/components/features/PersonaFusions";
import { SkillList } from "@/components/features/SkillList";
import { StatBars } from "@/components/features/StatBars";
import { ArcanaBadge } from "@/components/icons/ArcanaBadge";
import { artworkUrl } from "@/lib/game/artwork";
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
      <div className="space-y-4">
        <Link href="/" className="text-sm text-muted-foreground hover:text-p3r-cyan">
          ← Compendium
        </Link>
        <PageHeader title={persona.name} kicker={`Lv ${persona.level} · ${persona.arcana}`} backdrop={persona.arcana}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <ArcanaBadge arcana={persona.arcana} />
            {persona.dlc ? <span className="font-semibold text-p3r-red">{persona.dlc}</span> : null}
            {persona.unlock ? <span>{persona.unlock}</span> : null}
          </div>
          <a
            href={artworkUrl(persona)}
            target="_blank"
            rel="noreferrer"
            className="clip-slant mt-4 inline-flex items-center gap-2 bg-p3r-white px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-p3r-navy hover:bg-p3r-cyan"
          >
            View official artwork <span aria-hidden>↗</span>
          </a>
        </PageHeader>
      </div>

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
          <Link href={`/fusion/?t=${persona.slug}`} className="text-sm text-muted-foreground hover:text-p3r-cyan">
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
        <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-p3r-cyan">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
