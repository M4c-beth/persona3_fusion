import linksJson from "@/data/social-links.json";
import requestsJson from "@/data/requests.json";
import type { Arcana, ElizabethRequest, Persona, SocialLink } from "@/types/game";
import { PERSONAS } from "./data";

// Validated in src/lib/game/companions.test.ts.
export const SOCIAL_LINKS = linksJson as SocialLink[];
export const REQUESTS = requestsJson as ElizabethRequest[];

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
