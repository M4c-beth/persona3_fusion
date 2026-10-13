import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GiftList } from "@/components/features/GiftList";
import { PageHeader } from "@/components/features/PageHeader";
import { RankAnswers } from "@/components/features/RankAnswers";
import { WeekStrip } from "@/components/features/WeekStrip";
import { CharacterIcon } from "@/components/icons/CharacterIcon";
import { DIALOGUE, SOCIAL_LINKS, getSocialLinkBySlug, giftsFor, maxRankPersona, socialLinkSlug } from "@/lib/game/companions";

interface Props {
  params: Promise<{ arcana: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return SOCIAL_LINKS.map((l) => ({ arcana: socialLinkSlug(l.arcana) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const link = getSocialLinkBySlug((await params).arcana);
  return link ? { title: `${link.name} (${link.arcana})`, description: `${link.arcana} Social Link answers and gifts.` } : {};
}

export default async function SocialLinkPage({ params }: Props) {
  const link = getSocialLinkBySlug((await params).arcana);
  if (!link) notFound();
  const dialogue = DIALOGUE[link.arcana];
  const persona = maxRankPersona(link.arcana);
  const gifts = giftsFor(link.arcana);
  const hasGifts = gifts.loves.length + gifts.likes.length > 0;

  return (
    <article className="space-y-10">
      <div className="space-y-4">
        <Link href="/social-links/" className="text-sm text-muted-foreground hover:text-p3r-cyan">
          ← Social Links
        </Link>
        <div className="flex items-start gap-5">
          <CharacterIcon name={link.name} arcana={link.arcana} className="mt-8 hidden w-20 sm:grid" />
          <PageHeader
            title={link.name}
            kicker={`${link.arcana} Social Link`}
            backdrop={link.arcana}
            reserve={140}
            className="flex-1"
          />
        </div>
      </div>

      {/* Phones: how to start, answers, gifts. Desktop: answers in the right column. */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr] lg:items-start">
          <Section title="How to start" className="lg:col-start-1 lg:row-start-1">
            <dl className="grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-2.5 border bg-card p-4 text-sm">
              <dt className="text-muted-foreground">Starts</dt>
              <dd>{link.start}</dd>
              <dt className="text-muted-foreground">How</dt>
              <dd>{link.howToStart}</dd>
              {link.days ? (
                <>
                  <dt className="text-muted-foreground">When</dt>
                  <dd>
                    <WeekStrip days={link.days} night={link.time === "Night"} />
                  </dd>
                </>
              ) : null}
              {link.location ? (
                <>
                  <dt className="text-muted-foreground">Where</dt>
                  <dd>{link.location}</dd>
                </>
              ) : null}
              {persona ? (
                <>
                  <dt className="text-muted-foreground">Max rank</dt>
                  <dd>
                    Unlocks{" "}
                    <Link href={`/persona/${persona.slug}/`} className="font-semibold text-p3r-cyan hover:text-p3r-white">
                      {persona.name}
                    </Link>{" "}
                    for fusion
                  </dd>
                </>
              ) : null}
            </dl>
            {link.note ? <p className="text-xs text-p3r-sky">{link.note}</p> : null}
          </Section>

        <Section title="Answers" className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {dialogue && dialogue.ranks.length ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Points are shown <span className="text-p3r-white">with</span> / <span className="text-p3r-white">without</span>{" "}
                {/^[AEIOU]/.test(link.arcana) ? "an" : "a"} {link.arcana} Persona in your stock. <span className="text-p3r-cyan">★</span> marks the best answer.
              </p>
              {dialogue.ranks.map((rank, i) => (
                <RankAnswers key={rank.label} rank={rank} open={i === 0} />
              ))}
              {dialogue.extras.length ? (
                <>
                  <h3 className="pt-4 font-heading text-sm font-bold uppercase tracking-wider text-p3r-sky">
                    Phone invites &amp; extras
                  </h3>
                  {dialogue.extras.map((rank) => (
                    <RankAnswers key={rank.label} rank={rank} />
                  ))}
                </>
              ) : null}
              <p className="pt-2 text-xs text-muted-foreground">
                Answers adapted from the{" "}
                <a
                  href={`https://megamitensei.fandom.com/wiki/${encodeURIComponent(dialogue.page.replace(/ /g, "_"))}?oldid=${dialogue.revision}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-dotted underline-offset-2 hover:text-p3r-white"
                >
                  Megami Tensei Wiki
                </a>{" "}
                (CC BY-SA 3.0).
              </p>
            </div>
          ) : (
            <p className="border border-dashed p-4 text-sm text-muted-foreground">
              This link ranks up through the story. There are no answers to choose.
            </p>
          )}
        </Section>

          <Section title="Gifts" className="lg:col-start-1 lg:row-start-2">
            {hasGifts ? (
              <GiftList {...gifts} />
            ) : (
              <p className="border border-dashed p-4 text-sm text-muted-foreground">
                {link.name} isn&apos;t on Reload&apos;s gift lists. Gifts go to characters who invite you out by phone.
              </p>
            )}
          </Section>
      </div>
    </article>
  );
}

function Section({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`space-y-3 ${className ?? ""}`}>
      <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-p3r-cyan">{title}</h2>
      {children}
    </section>
  );
}
