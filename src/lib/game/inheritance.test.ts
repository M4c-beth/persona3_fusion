import { describe, expect, it } from "vitest";
import { getPersona, getSkill } from "./data";
import { canInherit, inheritBlock, inheritLimit } from "./inheritance";

const p = (name: string) => getPersona(name)!;
const s = (name: string) => getSkill(name)!;

describe("inheritance", () => {
  it("blocks persona-exclusive skills", () => {
    expect(inheritBlock(p("Pixie"), s("Die For Me!"))).toBe("exclusive");
  });

  it("blocks elements the persona's inherit type forbids", () => {
    expect(inheritBlock(p("Jack Frost"), s("Agi"))).toBe("element");
    expect(canInherit(p("Jack Frost"), s("Bufu"))).toBe(true);
  });

  it("lets almighty and passive skills through any inherit type", () => {
    expect(canInherit(p("Jack Frost"), s("Megidolaon"))).toBe(true);
    expect(canInherit(p("Thanatos"), s("Enduring Soul"))).toBe(true);
  });

  it.each([
    [2, 1],
    [5, 1],
    [6, 2],
    [9, 3],
    [12, 4],
    [24, 5],
    [32, 6],
    [40, 6],
  ])("allows %i ingredient skills to pass on %i", (total, limit) => {
    expect(inheritLimit(total)).toBe(limit);
  });
});
