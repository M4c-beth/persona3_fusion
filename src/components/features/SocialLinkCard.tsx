import Link from "next/link";
import { TarotCard } from "@/components/icons/TarotCard";
import { DIALOGUE, giftsFor, maxRankPersona, socialLinkSlug } from "@/lib/game/companions";
import { ARCANA_NUMERAL } from "@/lib/game/labels";
import type { SocialLink } from "@/types/game";
import { WeekStrip } from "./WeekStrip";

export function SocialLinkCard({ link }: { link: SocialLink }) {
  const persona = maxRankPersona(link.arcana);
  const hasAnswers = !!DIALOGUE[link.arcana]?.ranks.length;
  const gifts = giftsFor(link.arcana);
  const hasGifts = gifts.loves.length + gifts.likes.length > 0;
  const href = `/social-links/${socialLinkSlug(link.arcana)}/`;

  return (
    <article className="relative flex flex-col gap-3 overflow-hidden border bg-card p-4">
      <span
        aria-hidden
        className="display pointer-events-none absolute -right-2 -top-3 text-7xl text-p3r-cyan/10"
      >
        {ARCANA_NUMERAL[link.arcana] || "∞"}
      </span>
      <header className="flex items-center gap-3">
        <TarotCard arcana={link.arcana} className="w-12" />
        <div>
          <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-p3r-cyan">{link.arcana}</p>
          <h2 className="display text-2xl text-p3r-white">
            <Link href={href} className="hover:text-p3r-cyan">
              {link.name}
            </Link>
          </h2>
        </div>
      </header>

      <dl className="grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-2 text-sm">
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
      </dl>

      {link.note ? <p className="text-xs text-p3r-sky">{link.note}</p> : null}

      {hasAnswers || hasGifts ? (
        <Link
          href={href}
          className="clip-slant self-start bg-p3r-white px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-p3r-navy hover:bg-p3r-cyan"
        >
          {hasAnswers && hasGifts ? "Answers & gifts" : hasAnswers ? "Rank answers" : "Gifts"} →
        </Link>
      ) : null}

      <footer className="mt-auto flex items-center justify-between gap-3 border-t pt-3 text-sm">
        <span className="text-muted-foreground">{link.automatic ? "Ranks up with the story" : "Max rank unlocks"}</span>
        {persona ? (
          <Link href={`/persona/${persona.slug}/`} className="font-semibold text-p3r-cyan hover:text-p3r-white">
            {persona.name} →
          </Link>
        ) : null}
      </footer>
    </article>
  );
}
