import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/features/PageHeader";
import { SocialLinkCard } from "@/components/features/SocialLinkCard";
import { LINKED_EPISODES, SOCIAL_LINKS, linkedEpisodePersona } from "@/lib/game/companions";

export const metadata: Metadata = { title: "Social Links" };

export default function SocialLinksPage() {
  return (
    <div className="space-y-12">
      <PageHeader title="Social Links" backdrop="Bonds">
        Who to meet, when and where. Maxing a link unlocks its strongest Persona for fusion.
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SOCIAL_LINKS.map((link) => (
          <SocialLinkCard key={link.arcana} link={link} />
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex gap-4">
          <span aria-hidden className="w-2 shrink-0 bg-p3r-blue" />
          <div>
            <h2 className="display text-3xl text-p3r-white">Linked Episodes</h2>
            <p className="text-muted-foreground">
              Reload&apos;s hangouts with the rest of S.E.E.S. Finish a teammate&apos;s episodes to unlock their Persona.
            </p>
          </div>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LINKED_EPISODES.map(({ name, key }) => {
            const persona = linkedEpisodePersona(key);
            return (
              <li key={key} className="flex items-center justify-between gap-3 border bg-card px-4 py-3">
                <span className="display text-xl text-p3r-white">{name}</span>
                {persona ? (
                  <Link href={`/persona/${persona.slug}/`} className="text-sm font-semibold text-p3r-cyan hover:text-p3r-white">
                    {persona.name} →
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
