import { describe, expect, it } from "vitest";
import { ARCANA } from "@/types/game";
import {
  DIALOGUE,
  GIFTS,
  LINKED_EPISODES,
  REQUESTS,
  SOCIAL_LINKS,
  bestOptions,
  getSocialLinkBySlug,
  giftsFor,
  linkedEpisodePersona,
  maxRankPersona,
  requestUnlock,
  socialLinkSlug,
} from "./companions";
import { getPersona, getSkill } from "./data";
import { giftsSchema, requestsSchema, socialLinkDialogueSchema, socialLinksSchema } from "./schema";

describe("Social Links", () => {
  it("matches the schema", () => {
    expect(() => socialLinksSchema.parse(SOCIAL_LINKS)).not.toThrow();
  });

  it("covers every arcana once, in order", () => {
    expect(SOCIAL_LINKS.map((l) => l.arcana)).toEqual([...ARCANA]);
  });

  it("gives a schedule to every link that isn't automatic", () => {
    for (const link of SOCIAL_LINKS) {
      if (!link.automatic) {
        expect(link.days, link.name).toBeDefined();
        expect(link.location, link.name).toBeDefined();
      }
    }
  });

  it("unlocks a persona at max rank for every arcana", () => {
    for (const arcana of ARCANA) expect(maxRankPersona(arcana), arcana).toBeDefined();
    expect(maxRankPersona("Death")?.name).toBe("Thanatos");
  });

  it("unlocks a persona for every Linked Episode", () => {
    for (const { key } of LINKED_EPISODES) expect(linkedEpisodePersona(key), key).toBeDefined();
    expect(linkedEpisodePersona("Junpei")?.name).toBe("Surt");
  });
});

describe("Social Link answers and gifts", () => {
  it("matches the dialogue schema", () => {
    expect(() => socialLinkDialogueSchema.parse(DIALOGUE)).not.toThrow();
  });

  it("has answers for every link that isn't story-driven", () => {
    for (const link of SOCIAL_LINKS) {
      if (!link.automatic) expect(DIALOGUE[link.arcana]?.ranks.length, link.arcana).toBeGreaterThan(0);
    }
  });

  it("keeps the player's name as a placeholder", () => {
    const rank2 = DIALOGUE.Hierophant!.ranks[1];
    expect(rank2.prompts[0].options[0].text).toBe("[Name] [Surname].");
    expect(rank2.bonus).toBe("Melon Bread");
  });

  it("picks the highest-scoring answers", () => {
    const prompt = DIALOGUE.Magician!.ranks[1].prompts[0];
    expect(bestOptions(prompt).map((o) => o.text)).toEqual(["No way.", "That's a secret."]);
  });

  it("marks no best answer when every answer scores the same", () => {
    expect(bestOptions(DIALOGUE.Magician!.ranks[0].prompts[0])).toEqual([]);
  });

  it("ignores outcome-only answers like romance choices", () => {
    const prompt = { line: "x", options: [{ text: "a", with: "Romance", without: "Romance" }] };
    expect(bestOptions(prompt)).toEqual([]);
  });

  it("matches the gift schema and lists gifts by character", () => {
    expect(() => giftsSchema.parse(GIFTS)).not.toThrow();
    expect(giftsFor("Empress").loves.map((g) => g.name)).toEqual(["Goggle-eyed Idol", "Japanese Doll", "Kaleidoscope"]);
    expect(giftsFor("Aeon")).toEqual({ loves: [], likes: [] });
  });

  it("finds links by arcana slug", () => {
    expect(getSocialLinkBySlug("hanged-man")?.name).toBe("Maiko Oohashi");
    expect(socialLinkSlug("Hanged Man")).toBe("hanged-man");
  });
});

describe("Elizabeth's requests", () => {
  it("matches the schema", () => {
    expect(() => requestsSchema.parse(REQUESTS)).not.toThrow();
  });

  it("numbers requests 1 to 101 in order", () => {
    expect(REQUESTS.map((r) => r.number)).toEqual(Array.from({ length: 101 }, (_, i) => i + 1));
  });

  it("only requires earlier requests", () => {
    for (const r of REQUESTS) for (const n of r.requires ?? []) expect(n, `#${r.number}`).toBeLessThan(r.number);
  });

  it("links fusion targets to real personas and skills", () => {
    for (const { number, link } of REQUESTS) {
      if (link?.persona) expect(getPersona(link.persona), `#${number}`).toBeDefined();
      for (const skill of link?.skills ?? []) expect(getSkill(skill), `#${number} ${skill}`).toBeDefined();
    }
  });

  it("asks only for skills the target persona can end up with", () => {
    for (const { number, link } of REQUESTS) {
      const persona = link?.persona ? getPersona(link.persona) : undefined;
      for (const skill of persona ? (link?.skills ?? []) : []) {
        const learns = persona!.skills.some((s) => s.name === skill);
        const blocked = persona!.cannotInherit?.includes(getSkill(skill)!.type);
        expect(learns || !blocked, `#${number} ${skill}`).toBe(true);
      }
    }
  });

  it("matches the rewards that unlock personas", () => {
    expect(requestUnlock(24)?.name).toBe("King Frost");
    expect(REQUESTS[23].reward).toBe("Sugar Key");
    expect(requestUnlock(87)?.name).toBe("Masakado");
    expect(REQUESTS[86].reward).toBe("Masakados");
    expect(requestUnlock(1)).toBeUndefined();
  });
});
