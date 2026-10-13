import type { Persona } from "@/types/game";

const WIKI = "https://megamitensei.fandom.com/wiki/";

/** Wiki pages whose plain name lands on a disambiguation page (checked against the wiki API). */
const PAGE_OVERRIDES: Record<string, string> = {
  Milady: "Milady (Persona 5)",
  Messiah: "Messiah (Persona)",
  Bishamonten: "Bishamonten (demon)",
};

/**
 * Megami Tensei Wiki article with the Persona's official artwork. We link to it
 * rather than host ATLUS's art on this site.
 */
export function artworkUrl(persona: Persona): string {
  const name = persona.name.replace(/ \(P5R\)$/, "");
  const page = PAGE_OVERRIDES[name] ?? name;
  return WIKI + encodeURIComponent(page.replace(/ /g, "_"));
}
