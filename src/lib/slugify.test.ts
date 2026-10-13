import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("strips diacritics", () => {
    expect(slugify("Arsène")).toBe("arsene");
  });

  it("hyphenates punctuation and spaces", () => {
    expect(slugify("Jack-o'-Lantern")).toBe("jack-o-lantern");
    expect(slugify("Loki (P5R)")).toBe("loki-p5r");
  });
});
