import { describe, expect, it } from "vitest";
import { ARCANA } from "@/types/game";
import { LINKED_EPISODES, REQUESTS, SOCIAL_LINKS, linkedEpisodePersona, maxRankPersona, requestUnlock } from "./companions";
import { getPersona, getSkill } from "./data";
import { requestsSchema, socialLinksSchema } from "./schema";

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
