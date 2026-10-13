import Image, { type StaticImageData } from "next/image";
import aeon from "@/assets/tarot/aeon.svg";
import chariot from "@/assets/tarot/chariot.webp";
import death from "@/assets/tarot/death.webp";
import devil from "@/assets/tarot/devil.webp";
import emperor from "@/assets/tarot/emperor.webp";
import empress from "@/assets/tarot/empress.webp";
import fool from "@/assets/tarot/fool.webp";
import fortune from "@/assets/tarot/fortune.webp";
import hangedMan from "@/assets/tarot/hanged-man.webp";
import hermit from "@/assets/tarot/hermit.webp";
import hierophant from "@/assets/tarot/hierophant.webp";
import judgement from "@/assets/tarot/judgement.webp";
import justice from "@/assets/tarot/justice.webp";
import lovers from "@/assets/tarot/lovers.webp";
import magician from "@/assets/tarot/magician.webp";
import moon from "@/assets/tarot/moon.webp";
import priestess from "@/assets/tarot/priestess.webp";
import star from "@/assets/tarot/star.webp";
import strength from "@/assets/tarot/strength.webp";
import sun from "@/assets/tarot/sun.webp";
import temperance from "@/assets/tarot/temperance.webp";
import tower from "@/assets/tarot/tower.webp";
import { cn } from "@/lib/utils";
import type { Arcana } from "@/types/game";

/** Rider–Waite–Smith Major Arcana (Pamela Colman Smith, 1910, public domain); Aeon is our own card. */
const CARDS: Record<Arcana, StaticImageData> = {
  Fool: fool,
  Magician: magician,
  Priestess: priestess,
  Empress: empress,
  Emperor: emperor,
  Hierophant: hierophant,
  Lovers: lovers,
  Chariot: chariot,
  Justice: justice,
  Hermit: hermit,
  Fortune: fortune,
  Strength: strength,
  "Hanged Man": hangedMan,
  Death: death,
  Temperance: temperance,
  Devil: devil,
  Tower: tower,
  Star: star,
  Moon: moon,
  Sun: sun,
  Judgement: judgement,
  Aeon: aeon,
};

export function TarotCard({ arcana, className, priority }: { arcana: Arcana; className?: string; priority?: boolean }) {
  return (
    <Image
      src={CARDS[arcana]}
      alt={`${arcana} tarot card`}
      sizes="(min-width: 640px) 160px, 96px"
      priority={priority}
      className={cn("h-auto w-16 shrink-0 shadow-lg shadow-black/40 ring-1 ring-p3r-cyan/30", className)}
    />
  );
}
