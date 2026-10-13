# P3R Fusion

A Persona 3 Reload compendium and fusion calculator, with support for the DLC persona packs.

**Live site:** https://m4c-beth.github.io/persona3_fusion/

## Features

- **Compendium**: all 194 personas, with search, an arcana filter, sortable columns and affinities.
- **Persona pages**: stats, affinities, skills, heart item, unlock condition, every recipe that makes the persona, and everything it fuses into.
- **Fusion planner**: choose a persona and the skills it should have, and get the shortest fusion path. Skills are carried along chains of fusions, following element inheritance limits.
- **Skills**: every learnable skill, filterable by type, with the personas that learn it.
- **Social Links**: all 22 arcana plus Reload's Linked Episodes. Shows how to start each one, the days and places to find the person, and the Persona that maxing it unlocks. Each link has its own page with every rank's answer choices (points with or without a matching Persona, best answer marked) and the gifts that character likes.
- **Elizabeth's Requests**: all 101 requests with when they appear, deadlines, how to complete them and rewards. Fusion requests link straight into the planner.
- **DLC toggle**: turn the P5R Persona Set 1, P5R Persona Set 2 and P4G Persona Set on or off. Fusion results change to match.

## Development

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # Vitest
npm run lint
npm run build        # static export to out/
npm run import-data  # re-import game data from the pinned source commit
```

The site is a static export deployed by `.github/workflows/deploy.yml` on every push to `main`.

## Data and credits

Social Link answer tables (`src/data/social-link-dialogue.json`) are adapted from the [Megami Tensei Wiki](https://megamitensei.fandom.com/) with `npm run import-social-links`. They are licensed [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), and each page links the wiki revision it came from. Gift preferences come from Prima Games' Reload gift guide.

Social Link and request details were checked against several guides (Game8, Game's Horizon, Inverse, PowerPyx, Exputer, Prima Games and RPG Site). They are written in our own words. Where the guides disagree, the page says so.

Game data comes from [aqiu384/megaten-fusion-tool](https://github.com/aqiu384/megaten-fusion-tool), which is public domain (Unlicense). It is imported at a pinned commit by `scripts/import-data.ts` and validated with zod. The fusion rules are a port of that tool's P3R logic.

The icons are original SVGs drawn for this project. Social Link tarot cards are the public-domain Rider–Waite–Smith deck (Pamela Colman Smith, 1910) from Wikimedia Commons; the Aeon card, which that deck lacks, is our own. No game assets are hosted. Persona pages link to their official artwork on the Megami Tensei Wiki instead.

This is an unofficial fan project. Persona 3 Reload is © ATLUS / SEGA, and this project is not affiliated with or endorsed by either.
