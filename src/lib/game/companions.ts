import dialogueJson from "@/data/social-link-dialogue.json";
import giftsJson from "@/data/gifts.json";
import linksJson from "@/data/social-links.json";
import requestsJson from "@/data/requests.json";
import { slugify } from "@/lib/slugify";
import type {
  Arcana,
  DialogueOption,
  DialoguePrompt,
  ElizabethRequest,
  Gift,
  Persona,
  SocialLink,
  SocialLinkDialogue,
} from "@/types/game";
import { PERSONAS } from "./data";

// Validated in src/lib/game/companions.test.ts.
export const SOCIAL_LINKS = linksJson as SocialLink[];
export const REQUESTS = requestsJson as ElizabethRequest[];
export const DIALOGUE = dialogueJson as Partial<Record<Arcana, SocialLinkDialogue>>;
export const GIFTS = giftsJson as Gift[];

export const socialLinkSlug = (arcana: Arcana) => slugify(arcana);
export const getSocialLinkBySlug = (slug: string) => SOCIAL_LINKS.find((l) => socialLinkSlug(l.arcana) === slug);

/** Gifts the link's character loves and likes (only some characters accept gifts). */
export function giftsFor(arcana: Arcana): { loves: Gift[]; likes: Gift[] } {
  return {
    loves: GIFTS.filter((g) => g.loves.includes(arcana)),
    likes: GIFTS.filter((g) => g.likes.includes(arcana)),
  };
}

const points = (value: string) => (/^[+-]?\d+$/.test(value) ? Number(value) : null);

/** Answers worth the most points (with a matching Persona); none when every answer is equal. */
export function bestOptions(prompt: DialoguePrompt): DialogueOption[] {
  const scored = prompt.options.map((o) => ({ o, p: points(o.with) }));
  const top = Math.max(...scored.map(({ p }) => p ?? -Infinity));
  if (!Number.isFinite(top) || top <= 0 || scored.every(({ p }) => p === top)) return [];
  return scored.filter(({ p }) => p === top).map(({ o }) => o);
}

/** Party members whose Linked Episodes (Reload's teammate links) unlock a Persona. */
export const LINKED_EPISODES = [
  { name: "Junpei Iori", key: "Junpei" },
  { name: "Akihiko Sanada", key: "Akihiko" },
  { name: "Koromaru", key: "Koromaru" },
  { name: "Ken Amada", key: "Ken" },
  { name: "Shinjiro Aragaki", key: "Shinjiro" },
  { name: "Ryoji Mochizuki", key: "Ryoji" },
] as const;

const byUnlock = (text: string) => PERSONAS.find((p) => p.unlock === text);

/** Persona unlocked for fusion by maxing an arcana's Social Link. */
export function maxRankPersona(arcana: Arcana): Persona | undefined {
  return byUnlock(`Max the ${arcana} Social Link`);
}

/** Persona unlocked by finishing a teammate's Linked Episodes. */
export function linkedEpisodePersona(key: string): Persona | undefined {
  return byUnlock(`Max ${key}'s Link`);
}

/** Persona whose fusion a request's reward unlocks, if any. */
export function requestUnlock(number: number): Persona | undefined {
  return byUnlock(`Clear Elizabeth's Request #${number}`);
}
