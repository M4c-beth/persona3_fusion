import { describe, expect, it } from "vitest";
import { artworkUrl } from "./artwork";
import { getPersona } from "./data";

const p = (name: string) => getPersona(name)!;

describe("artworkUrl", () => {
  it("links to the persona's wiki article", () => {
    expect(artworkUrl(p("Jack Frost"))).toBe("https://megamitensei.fandom.com/wiki/Jack_Frost");
  });

  it("encodes special characters", () => {
    expect(artworkUrl(p("Arsène"))).toBe("https://megamitensei.fandom.com/wiki/Ars%C3%A8ne");
  });

  it("drops the P5R tag used to tell the two Lokis apart", () => {
    expect(artworkUrl(p("Loki (P5R)"))).toBe("https://megamitensei.fandom.com/wiki/Loki");
  });

  it("skips disambiguation pages", () => {
    expect(artworkUrl(p("Messiah"))).toBe("https://megamitensei.fandom.com/wiki/Messiah_(Persona)");
    expect(artworkUrl(p("Milady"))).toBe("https://megamitensei.fandom.com/wiki/Milady_(Persona_5)");
  });
});
