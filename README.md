# P3R Fusion

A Persona 3 Reload compendium and fusion calculator, with support for the DLC persona packs.

**Live site:** https://m4c-beth.github.io/persona3_fusion/

## Features

- **Compendium**: all 194 personas, with search, an arcana filter, sortable columns and affinities.
- **Persona pages**: stats, affinities, skills, heart item and unlock condition. Also every recipe that makes the persona and everything it fuses into.
- **Fusion calculator**: pick two personas to see the result. The URL can be shared, for example `/fusion/?a=orpheus&b=thanatos`.
- **Skills**: every learnable skill, filterable by type, with the personas that learn it.
- **DLC toggle**: turn the P5R Persona Set 1, P5R Persona Set 2 and P4G Persona Set on or off. Fusion results change to match. The choice is saved in the browser.

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

Game data comes from [aqiu384/megaten-fusion-tool](https://github.com/aqiu384/megaten-fusion-tool), which is public domain (Unlicense). It is imported at a pinned commit by `scripts/import-data.ts` and validated with zod. The fusion rules are a port of that tool's P3R logic.

The icons are original SVGs drawn for this project. No game assets are used.

This is an unofficial fan project. Persona 3 Reload is © ATLUS / SEGA, and this project is not affiliated with or endorsed by either.
