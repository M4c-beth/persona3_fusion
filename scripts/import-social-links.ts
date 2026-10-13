/**
 * Imports Persona 3 Reload Social Link dialogue choices from the Megami Tensei Wiki
 * (CC BY-SA 3.0), validates them and writes src/data/social-link-dialogue.json.
 *
 * Usage: npm run import-social-links
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { socialLinkDialogueSchema } from "../src/lib/game/schema";
import type { Arcana, SocialLinkDialogue, SocialLinkRank } from "../src/types/game";

const API = "https://megamitensei.fandom.com/api.php";
const OUT = path.resolve(__dirname, "../src/data/social-link-dialogue.json");

/** Wiki page per arcana. Fool, Judgement (story-driven) have no choices to record. */
const PAGES: Partial<Record<Arcana, string>> = {
  Magician: "Kenji Tomochika",
  Priestess: "Fuuka Yamagishi",
  Empress: "Mitsuru Kirijo",
  Emperor: "Hidetoshi Odagiri",
  Hierophant: "Bunkichi and Mitsuko",
  Lovers: "Yukari Takeba",
  Chariot: "Kazushi Miyamoto",
  Justice: "Chihiro Fushimi",
  Hermit: "Isako Toriumi", // the wiki keeps Maya's link on this page
  Fortune: "Keisuke Hiraga",
  Strength: "Yuko Nishiwaki",
  "Hanged Man": "Maiko Oohashi",
  Death: "Pharos",
  Temperance: "Andre Laurent Jean Geraux",
  Devil: "President Tanaka",
  Tower: "Mutatsu",
  Star: "Mamoru Hayase",
  Moon: "Nozomi Suemitsu",
  Sun: "Akinari Kamiki",
  Aeon: "Aigis",
};

const parseResponse = z.object({
  parse: z.object({ revid: z.number(), wikitext: z.object({ "*": z.string() }) }),
});

function placeholders(s: string): string {
  return s.replace(/<\s*protagonist([^>]*)>/gi, (_, rest: string) =>
    /last/i.test(rest) ? "[Surname]" : /kun/i.test(rest) ? "[Name]-kun" : "[Name]",
  );
}

function cleanText(s: string): string {
  return placeholders(s)
    .replace(/\{\{tt\|([^|}]*)\|[^}]*\}\}/gi, "$1")
    .replace(/\{\{tooltip\|[^|}]*\|([^}]*)\}\}/gi, "$1")
    .replace(/\{\{[^}]*\}\}/g, "")
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/'''?/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Text of a table cell line, minus any attribute prefix (style=...|). */
function cellText(line: string): string {
  let cell = placeholders(line.replace(/^\|/, ""))
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/\{\{tt\|([^|}]*)\|[^}]*\}\}/gi, "$1");
  if (/^\s*(style|colspan|rowspan|align|width|class|scope)\s*=/.test(cell) && cell.includes("|")) {
    cell = cell.slice(cell.indexOf("|") + 1);
  }
  return cleanText(cell);
}

function section(lines: string[], startRe: RegExp, endRe: RegExp): string[] {
  const start = lines.findIndex((l) => startRe.test(l));
  if (start < 0) return [];
  const end = lines.findIndex((l, i) => i > start && endRe.test(l));
  return lines.slice(start + 1, end < 0 ? lines.length : end);
}

/** Parses ";Label" + wikitable blocks: prompt rows span 3 columns, answers are text | with | without. */
function parseBlocks(lines: string[]): SocialLinkRank[] {
  const blocks: (SocialLinkRank & { expectBonus?: boolean })[] = [];
  let cur: (typeof blocks)[number] | null = null;
  let row: string[] = [];
  const flush = () => {
    if (cur && row.length) {
      const prompt = row.find((l) => /colspan="?3/.test(l));
      const outcomeRow = row.length === 2 && /colspan="?2/.test(row[1]);
      if (prompt) {
        const text = cellText(prompt);
        if (/^Additional bonus/i.test(text)) cur.expectBonus = true;
        else if (cur.expectBonus) {
          cur.bonus = text;
          cur.expectBonus = false;
        } else cur.prompts.push({ line: text, options: [] });
      } else if (outcomeRow && cur.prompts.length) {
        const outcome = cellText(row[1]);
        cur.prompts.at(-1)!.options.push({ text: cellText(row[0]), with: outcome, without: outcome });
      } else if (row.length >= 3) {
        const [text, w, wo] = row.slice(0, 3).map((c) => cellText(c) || "?");
        if (text !== "Response" && cur.prompts.length) cur.prompts.at(-1)!.options.push({ text, with: w, without: wo });
      }
    }
    row = [];
  };
  for (const raw of lines) {
    const l = raw.trim();
    if (l.startsWith(";")) {
      flush();
      cur = { label: cleanText(l.slice(1)), prompts: [] };
      blocks.push(cur);
    } else if (!cur) {
      continue;
    } else if (l === "|-" || l.startsWith("|}") || l.startsWith("{|") || l.startsWith("!")) {
      flush();
    } else if (l.startsWith("|")) {
      row.push(l);
    }
  }
  flush();
  for (const b of blocks) delete b.expectBonus;
  return blocks.filter((b) => b.prompts.length || b.bonus);
}

function parsePage(wikitext: string): Pick<SocialLinkDialogue, "ranks" | "extras"> {
  const all = wikitext.split("\n");
  const dialogue = all.findIndex((l) => /^==\s*Dialogue Options\s*==/.test(l));
  const lines = dialogue >= 0 ? all.slice(dialogue) : [];
  const blocks = parseBlocks(section(lines, /^===\s*(?:'')?\s*Persona 3 Reload\s*(?:'')?\s*===\s*$/, /^={2,3}[^=]/));
  const other = lines.findIndex((l) => /^===\s*Other\s*===/.test(l));
  const otherReload =
    other >= 0
      ? parseBlocks(
          section(
            lines.slice(other),
            /^====\s*(?:'')?\s*Persona 3 Reload\s*(?:'')?\s*====\s*$/,
            /^={2,4}[^=]|\{\{P3 SL Navigation/,
          ),
        )
      : [];
  return {
    ranks: blocks.filter((b) => /^Rank\b/.test(b.label)),
    extras: [...blocks.filter((b) => !/^Rank\b/.test(b.label)), ...otherReload],
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(title: string) {
  const url = `${API}?action=parse&page=${encodeURIComponent(title)}&prop=wikitext|revid&format=json`;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "persona3-fusion data import (fan site)" } });
    if (res.ok) return parseResponse.parse(await res.json()).parse;
    if (attempt >= 3) throw new Error(`${title}: HTTP ${res.status}`);
    await sleep(5000 * (attempt + 1));
  }
}

async function main() {
  const out: Partial<Record<Arcana, SocialLinkDialogue>> = {};
  for (const [arcana, name] of Object.entries(PAGES) as [Arcana, string][]) {
    const page = `Social Link/${name}`;
    const { revid, wikitext } = await fetchPage(page);
    out[arcana] = { page, revision: revid, ...parsePage(wikitext["*"]) };
    console.log(`${arcana}: ${out[arcana]!.ranks.length} ranks`);
    await sleep(1500);
  }
  writeFileSync(OUT, JSON.stringify(socialLinkDialogueSchema.parse(out), null, 2) + "\n");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
